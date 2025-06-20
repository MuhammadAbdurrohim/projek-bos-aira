package com.airastore.app.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.airastore.app.R
import com.airastore.app.databinding.ModalProductBinding
import com.airastore.app.models.Product
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder

class ModalProductFragment : DialogFragment() {

    private var _binding: ModalProductBinding? = null
    private val binding get() = _binding!!

    private var product: Product? = null

    companion object {
        const val TAG = "ModalProductFragment"
        private const val ARG_PRODUCT = "arg_product"

        fun newInstance(product: Product): ModalProductFragment {
            val fragment = ModalProductFragment()
            val args = Bundle()
            args.putParcelable(ARG_PRODUCT, product)
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        product = arguments?.getParcelable(ARG_PRODUCT)
        setStyle(STYLE_NORMAL, R.style.ThemeOverlay_MaterialComponents_Dialog)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ModalProductBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        product?.let { bindProduct(it) }
        binding.btnEdit.setOnClickListener {
            // TODO: Implement edit action callback
            dismiss()
        }
        binding.btnClose.setOnClickListener {
            dismiss()
        }
    }

    private fun bindProduct(product: Product) {
        binding.ivProduct.loadImageWithPlaceholder(product.thumbnail, R.drawable.placeholder_product)
        binding.tvName.text = product.name
        binding.tvDescription.text = product.description ?: getString(R.string.no_description)
        binding.tvPrice.text = product.price.toString() // Format as needed
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
