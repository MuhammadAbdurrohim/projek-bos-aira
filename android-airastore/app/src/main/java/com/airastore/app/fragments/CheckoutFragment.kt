package com.airastore.app.fragments

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.airastore.app.R
import com.airastore.app.databinding.FragmentCheckoutBinding
import com.airastore.app.models.PaymentMethod
import com.airastore.app.viewmodels.CheckoutViewModel
import com.google.android.material.snackbar.Snackbar

class CheckoutFragment : Fragment() {

    private var _binding: FragmentCheckoutBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: CheckoutViewModel

    private var selectedPaymentType: String = "BANK" // "BANK" or "EWALLET"
    private var paymentProofUri: Uri? = null

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val data: Intent? = result.data
            data?.data?.let { uri ->
                paymentProofUri = uri
                binding.ivPaymentProof.setImageURI(uri)
                binding.tvError.text = ""
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCheckoutBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(CheckoutViewModel::class.java)

        setupPaymentMethodSelection()
        setupUploadClick()
        setupSubmitButton()
        observeViewModel()

        // Default selection
        binding.radioBank.isChecked = true
        updatePaymentDetails()
    }

    private fun setupPaymentMethodSelection() {
        binding.radioGroupPayment.setOnCheckedChangeListener { _, checkedId ->
            selectedPaymentType = when (checkedId) {
                R.id.radioBank -> "BANK"
                R.id.radioEwallet -> "EWALLET"
                else -> "BANK"
            }
            updatePaymentDetails()
        }
    }

    private fun updatePaymentDetails() {
        val container = binding.paymentDetailsContainer
        container.removeAllViews()

        val paymentMethods = viewModel.getUserPaymentMethods()

        val filteredMethods = paymentMethods.filter {
            when (selectedPaymentType) {
                "BANK" -> it.type.equals("BANK", ignoreCase = true)
                "EWALLET" -> it.type.equals("EWALLET", ignoreCase = true)
                else -> false
            }
        }

        if (filteredMethods.isEmpty()) {
            val tv = TextView(requireContext())
            tv.text = "Informasi metode pembayaran tidak tersedia."
            container.addView(tv)
            return
        }

        for (method in filteredMethods) {
            val tvBankName = TextView(requireContext())
            tvBankName.text = "Bank / Provider: ${method.provider}"
            tvBankName.textSize = 16f
            container.addView(tvBankName)

            val tvAccountName = TextView(requireContext())
            tvAccountName.text = "Nama Pemilik: ${method.accountName ?: "-"}"
            container.addView(tvAccountName)

            val tvAccountNumber = TextView(requireContext())
            tvAccountNumber.text = "Nomor Rekening / Nomor Tujuan: ${method.accountNumber ?: "-"}"
            container.addView(tvAccountNumber)

            val separator = View(requireContext())
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                2
            )
            params.setMargins(0, 16, 0, 16)
            separator.layoutParams = params
            separator.setBackgroundColor(resources.getColor(android.R.color.darker_gray))
            container.addView(separator)
        }
    }

    private fun setupUploadClick() {
        binding.ivPaymentProof.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            pickImageLauncher.launch(intent)
        }
    }

    private fun setupSubmitButton() {
        binding.btnSubmitPayment.setOnClickListener {
            if (paymentProofUri == null) {
                binding.tvError.text = "Silakan unggah bukti pembayaran terlebih dahulu."
                return@setOnClickListener
            }
            binding.tvError.text = ""
            viewModel.submitPaymentProof(selectedPaymentType, paymentProofUri!!)
        }
    }

    private fun observeViewModel() {
        viewModel.paymentSubmissionResult.observe(viewLifecycleOwner) { result ->
            when (result) {
                is CheckoutViewModel.Result.Success -> {
                    Snackbar.make(binding.root, "Pembayaran berhasil dikonfirmasi.", Snackbar.LENGTH_LONG).show()
                    requireActivity().onBackPressed()
                }
                is CheckoutViewModel.Result.Error -> {
                    binding.tvError.text = result.message
                }
                is CheckoutViewModel.Result.Loading -> {
                    // Optionally show loading indicator
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
