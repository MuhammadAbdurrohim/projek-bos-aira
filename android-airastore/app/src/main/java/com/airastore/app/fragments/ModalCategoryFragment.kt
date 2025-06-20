package com.airastore.app.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import com.airastore.app.R
import com.airastore.app.databinding.ModalCategoryBinding
import com.airastore.app.models.Category
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder

class ModalCategoryFragment : DialogFragment() {

    private var _binding: ModalCategoryBinding? = null
    private val binding get() = _binding!!

    private var category: Category? = null

    companion object {
        const val TAG = "ModalCategoryFragment"
        private const val ARG_CATEGORY = "arg_category"

        fun newInstance(category: Category): ModalCategoryFragment {
            val fragment = ModalCategoryFragment()
            val args = Bundle()
            args.putParcelable(ARG_CATEGORY, category)
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        category = arguments?.getParcelable(ARG_CATEGORY)
        setStyle(STYLE_NORMAL, R.style.ThemeOverlay_MaterialComponents_Dialog)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = ModalCategoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        category?.let { bindCategory(it) }
        binding.btnEdit.setOnClickListener {
            // TODO: Implement edit action callback
            dismiss()
        }
        binding.btnClose.setOnClickListener {
            dismiss()
        }
    }

    private fun bindCategory(category: Category) {
        binding.ivCategory.loadImageWithPlaceholder(category.imageUrl, R.drawable.placeholder_category)
        binding.tvName.text = category.name
        binding.tvDescription.text = category.description ?: getString(R.string.no_description)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
