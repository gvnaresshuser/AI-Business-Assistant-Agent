
import Swal from "sweetalert2";

// Common SweetAlert2 configuration
export const swalConfig = {
  confirmButtonColor: "#2563eb",
  cancelButtonColor: "#64748b",
  reverseButtons: true,
};

// Success toast
export const showSuccessToast = (message: string) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

// Error toast
export const showErrorToast = (message: string) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Reusable confirmation dialog
export const showConfirmDialog = (
  title: string,
  message: string,
  confirmText = "Yes, Continue"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    ...swalConfig,
  });
};

// Reusable delete confirmation
export const showDeleteConfirm = (
  title: string,
  message: string
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    focusCancel: true,
  });
};
