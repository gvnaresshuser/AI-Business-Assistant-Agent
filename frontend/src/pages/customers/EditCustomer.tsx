import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  getCustomerByIdApi,
  updateCustomerApi,
  type CreateCustomerInput,
} from "../../api/customerApi";

import { showSuccessToast, showErrorToast } from "../../utils/swal";

const customerTypes = ["Regular", "Retail", "Wholesale", "Corporate"];

const EditCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // ============================================
  // LOAD EXISTING CUSTOMER
  // ============================================

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        if (!id) {
          showErrorToast("Customer ID is missing.");
          navigate("/customers");
          return;
        }

        const customer = await getCustomerByIdApi(id);

        setForm({
          customer_name: customer.customer_name,
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          address: customer.address ?? "",
          city: customer.city ?? "",
          state: customer.state ?? "",
          pincode: customer.pincode ?? "",
          customer_type: customer.customer_type || "Regular",
        });
      } catch {
        showErrorToast("Unable to load customer details.");
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };

    void loadCustomer();
  }, [id, navigate]);

  // ============================================
  // HANDLE FORM CHANGES
  // ============================================

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      showErrorToast("Customer ID is missing.");
      return;
    }

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

    const payload: CreateCustomerInput = {
      customer_name: form.customer_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      pincode: form.pincode.trim() || null,
      customer_type: form.customer_type,
    };

    try {
      setSaving(true);

      await updateCustomerApi(id, payload);

      showSuccessToast("Customer updated successfully.");

      navigate(`/customers/${id}`);
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

      showErrorToast(message || "Unable to update customer.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading customer details...
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* PAGE HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/customers/${id}`)}
          className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Customer</h1>

          <p className="text-sm text-slate-500">Update customer information.</p>
        </div>
      </div>

      {/* CUSTOMER FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* CUSTOMER INFORMATION */}

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Customer Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* CUSTOMER NAME */}

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

            {/* CUSTOMER TYPE */}

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
                {!customerTypes.includes(form.customer_type) && (
                  <option value={form.customer_type}>
                    {form.customer_type}
                  </option>
                )}

                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* EMAIL */}

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

            {/* PHONE */}

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

        {/* ADDRESS INFORMATION */}

        <div className="border-t border-slate-100 pt-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Address Information
          </h2>

          <div className="space-y-5">
            {/* ADDRESS */}

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
              {/* CITY */}

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

              {/* STATE */}

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

              {/* PINCODE */}

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

        {/* FORM ACTIONS */}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/customers/${id}`)}
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
            {saving ? "Updating..." : "Update Customer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCustomer;
