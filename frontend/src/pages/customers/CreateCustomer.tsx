import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { createCustomerApi } from "../../api/customerApi";
import { showSuccessToast, showErrorToast } from "../../utils/swal";

const customerTypes = ["Regular", "Retail", "Wholesale", "Corporate"];

const CreateCustomer = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    customer_type: "Regular",
  });

  const [saving, setSaving] = useState(false);

  // ============================================
  // HANDLE FORM CHANGES
  // ============================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // HANDLE FORM SUBMISSION
  // ============================================

  const handleSubmit = async (
    e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0],
  ) => {
    e.preventDefault();

    if (!form.customer_name.trim()) {
      showErrorToast("Customer name is required.");
      return;
    }

    if (form.customer_name.trim().length > 150) {
      showErrorToast("Customer name cannot exceed 150 characters.");
      return;
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      showErrorToast("Please enter a valid email address.");
      return;
    }

    if (form.email.trim().length > 150) {
      showErrorToast("Email cannot exceed 150 characters.");
      return;
    }

    if (form.phone.trim().length > 30) {
      showErrorToast("Phone number cannot exceed 30 characters.");
      return;
    }

    if (form.city.trim().length > 100) {
      showErrorToast("City cannot exceed 100 characters.");
      return;
    }

    if (form.state.trim().length > 100) {
      showErrorToast("State cannot exceed 100 characters.");
      return;
    }

    if (form.pincode.trim().length > 15) {
      showErrorToast("Pincode cannot exceed 15 characters.");
      return;
    }

    try {
      setSaving(true);

      await createCustomerApi({
        customer_name: form.customer_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
        customer_type: form.customer_type,
      });

      showSuccessToast("Customer created successfully.");

      navigate("/customers");
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      showErrorToast(message || "Unable to create customer.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Customer</h1>

          <p className="text-sm text-slate-500">
            Add a new customer to your business.
          </p>
        </div>
      </div>

      {/* Customer Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* Customer Information */}

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Customer Name */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Customer Name *
              </label>

              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
                maxLength={150}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Customer Type */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Customer Type
              </label>

              <select
                name="customer_type"
                value={form.customer_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              >
                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                maxLength={150}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>

            {/* Phone */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={30}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}

        <div className="border-t border-slate-100 pt-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Address Information
          </h2>

          <div className="space-y-5">
            {/* Address */}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Enter complete address"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* City */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Enter city"
                />
              </div>

              {/* State */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  State
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Enter state"
                />
              </div>

              {/* Pincode */}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCustomer;
