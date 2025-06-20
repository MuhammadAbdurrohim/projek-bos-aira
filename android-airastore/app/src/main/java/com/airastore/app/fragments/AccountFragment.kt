package com.airastore.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.airastore.app.databinding.FragmentAccountBinding
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder
import com.airastore.app.utils.SessionManager

class AccountFragment : Fragment() {

    private var _binding: FragmentAccountBinding? = null
    private val binding get() = _binding!!

    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAccountBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())
        loadUserData()
    }

    private fun loadUserData() {
        val user = sessionManager.getUser()
        user?.let {
            binding.ivProfile.loadImageWithPlaceholder(it.profileImageUrl, com.airastore.app.R.drawable.ic_profile)
            binding.tvName.text = it.name
            binding.tvEmail.text = it.email
            binding.tvPhone.text = it.phone ?: "-"
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
