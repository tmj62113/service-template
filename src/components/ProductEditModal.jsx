import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "../config/api";

export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
  viewMode = false,
  onEditToggle,
}) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    stock: "",
    status: "Available",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(!viewMode);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        price: product.price || "",
        image: product.image || "",
        category: product.category || "",
        description: product.description || "",
        stock: product.stock || "",
        status: product.status || "Available",
      });
      setImagePreview(product.image || null);
    } else {
      setFormData({
        name: "",
        price: "",
        image: "",
        category: "",
        description: "",
        stock: "",
        status: "Available",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsEditing(!viewMode);
  }, [product, isOpen, viewMode]);

  // Focus management for modal
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Return focus to previously focused element when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within modal and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Trap focus within modal
      if (e.key === 'Tab') {
        const modal = document.querySelector('.modal-content');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", imageFile);

      const response = await fetch(
        getApiUrl("/api/products/upload-image"),
        {
          method: "POST",
          credentials: "include",
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDelete) return;

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    await onDelete(product._id);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Upload image first if there's a new file
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const url = product
        ? getApiUrl(`/api/products/${product._id}`)
        : getApiUrl("/api/products");

      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const savedProduct = await response.json();
      onSave(savedProduct);
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h2>
              {product
                ? viewMode && isEditing === false
                  ? "Product Details"
                  : "Edit Product"
                : "Add Product"}
            </h2>
            {product && viewMode && !isEditing && (
              <button
                type="button"
                className="edit-toggle-btn"
                onClick={() => {
                  setIsEditing(true);
                  if (onEditToggle) onEditToggle();
                }}
                title="Edit product"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#666" }}
                >
                  edit
                </span>
              </button>
            )}
          </div>
          <button
            ref={closeButtonRef}
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form" aria-label={product ? "Edit product form" : "Add product form"}>
          {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!isEditing}
              style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                disabled={!isEditing}
                style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                disabled={!isEditing}
                style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={!isEditing}
                style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={!isEditing}
                style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
              >
                <option value="Available">Available</option>
                <option value="In Review">In Review</option>
                <option value="Sold Out">Sold Out</option>
                <option value="Preorder">Preorder</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image *</label>
            <div className="image-upload-section">
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Product preview" />
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    disabled={!isEditing}
                  />
                  <label htmlFor="imageFile" className="file-label">
                    <span className="material-symbols-outlined">upload</span>
                    {imageFile ? imageFile.name : "Choose an image"}
                  </label>
                  <small className="helper-text">Or enter image URL:</small>
                </>
              )}
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                disabled={!isEditing}
                style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              disabled={!isEditing}
              style={{ backgroundColor: !isEditing ? "#f5f5f5" : "white" }}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={saving}
            >
              {isEditing ? "Cancel" : "Close"}
            </button>
            {isEditing && (
              <button
                type="submit"
                className="btn-save"
                disabled={saving || uploading}
              >
                {uploading
                  ? "Uploading image..."
                  : saving
                  ? "Saving..."
                  : product
                  ? "Update Product"
                  : "Create Product"}
              </button>
            )}
          </div>

          {product && (
            <div className="delete-section">
              <button
                type="button"
                onClick={handleDelete}
                className="btn-delete"
                disabled={saving}
              >
                <span className="material-symbols-outlined">delete</span>
                Delete Product Permanently
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
