"use client";

import UniversalProductForm from "@/app/components/UniversalProductForm";

export default function DynamicProductForm({
    allowedCategories,
    savingProduct,
    productMessage,
    onSaveProduct,
    initialData = null,
    onCancelEdit
}) {
    return (
        <UniversalProductForm 
            onPublishSuccess={(product) => {
                if (onSaveProduct) onSaveProduct(product);
            }}
            apiEndpoint="/API/partner/products"
        />
    );
}
