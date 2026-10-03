import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  DragEvent,
} from "react";
import {
  UserProfile,
  ProfileFormData,
  Gender,
  ProfileStatus,
  FormErrors,
} from "../types/profile";
import { PRESET_AVATARS } from "../data/presetAvatars";
import {
  Upload,
  User,
  X,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Camera,
  Image as ImageIcon,
} from "lucide-react";

interface ProfileFormProps {
  editingProfile: UserProfile | null;
  onSave: (data: ProfileFormData) => void;
  onCancelEdit: () => void;
}

const DEFAULT_FORM_DATA: ProfileFormData = {
  fullName: "",
  age: "",
  email: "",
  contactNumber: "",
  gender: "Female",
  address: "",
  status: "Active",
  avatarUrl: "",
};

export const ProfileForm: React.FC<ProfileFormProps> = ({
  editingProfile,
  onSave,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when editingProfile changes
  useEffect(() => {
    if (editingProfile) {
      setFormData({
        fullName: editingProfile.fullName,
        age: editingProfile.age,
        email: editingProfile.email,
        contactNumber: editingProfile.contactNumber,
        gender: editingProfile.gender,
        address: editingProfile.address,
        status: editingProfile.status,
        avatarUrl: editingProfile.avatarUrl,
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData(DEFAULT_FORM_DATA);
      setErrors({});
      setTouched({});
    }
  }, [editingProfile]);

  const validate = (data: ProfileFormData): FormErrors => {
    const errs: FormErrors = {};

    // Full Name
    if (!data.fullName.trim()) {
      errs.fullName = "Full name is required";
    } else if (data.fullName.trim().length < 2) {
      errs.fullName = "Name must be at least 2 characters";
    }

    // Age
    if (data.age === "" || data.age === undefined || isNaN(Number(data.age))) {
      errs.age = "Age is required";
    } else {
      const ageNum = Number(data.age);
      if (ageNum < 1 || ageNum > 120) {
        errs.age = "Age must be between 1 and 120";
      }
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(data.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    // Contact Number
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!data.contactNumber.trim()) {
      errs.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(data.contactNumber.trim())) {
      errs.contactNumber = "Please enter a valid phone number (min 7 digits)";
    }

    // Gender
    if (!data.gender) {
      errs.gender = "Please select a gender";
    }

    // Address
    if (!data.address.trim()) {
      errs.address = "Address is required";
    } else if (data.address.trim().length < 5) {
      errs.address = "Please enter a complete address (at least 5 characters)";
    }

    // Status
    if (!data.status) {
      errs.status = "Status is required";
    }

    return errs;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedValue =
      name === "age" ? (value === "" ? "" : Number(value)) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (touched[name]) {
      const currentErrors = validate({
        ...formData,
        [name]: updatedValue,
      });
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrors[name as keyof FormErrors],
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: currentErrors[field as keyof FormErrors],
    }));
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: "File must be an image (PNG, JPG, WebP)",
      }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: "Image size must be less than 5MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, avatarUrl: result }));
      setErrors((prev) => ({ ...prev, avatarUrl: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePresetAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setErrors((prev) => ({ ...prev, avatarUrl: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      age: true,
      email: true,
      contactNumber: true,
      gender: true,
      address: true,
      status: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleClear = () => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setTouched({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (editingProfile) {
      onCancelEdit();
    }
  };

  const genderOptions: Gender[] = ["Female", "Male"];
  const statusOptions: ProfileStatus[] = ["Active", "Inactive", "Pending"];

  return (
    <section
      id="profile-form"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8"
    >
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {editingProfile ? "Edit Profile" : "Create New Profile"}
            </h2>
            {editingProfile && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Updating: {editingProfile.fullName}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {editingProfile
              ? "Update the profile details below and click Save Profile."
              : "Fill in the information below to add a member to the profile directory."}
          </p>
        </div>

        {editingProfile && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Profile Image Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Profile Image
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Circular Preview Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-28 h-28 rounded-full border-2 transition-all flex items-center justify-center shrink-0 overflow-hidden bg-slate-50 shadow-inner group ${
                isDragging
                  ? "border-indigo-500 ring-4 ring-indigo-100 scale-102"
                  : "border-slate-200"
              }`}
            >
              {formData.avatarUrl ? (
                <>
                  <img
                    src={formData.avatarUrl}
                    alt="Profile Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-medium">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <User className="w-10 h-10 stroke-[1.5]" />
                  <span className="text-[10px] font-medium text-slate-400 mt-1">
                    No Image
                  </span>
                </div>
              )}
            </div>

            {/* Upload Controls & Actions */}
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                id="profile-image-upload"
                accept="image/png, image/jpeg, image/webp"
                onChange={onFileInputChange}
                className="hidden"
                aria-label="Upload profile image"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>
                    {formData.avatarUrl ? "Replace Photo" : "Upload Photo"}
                  </span>
                </button>

                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Preset Avatar Fast Selector */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500">
                  Or use sample portrait:
                </span>
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetAvatar(preset.url)}
                      title={`Select ${preset.name}`}
                      className="w-7 h-7 rounded-full border border-slate-200 overflow-hidden hover:scale-110 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Supports PNG, JPG, or WebP. Max size: 5MB. Circular preview
                automatically crops to 1:1.
              </p>

              {errors.avatarUrl && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.avatarUrl}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={() => handleBlur("fullName")}
              placeholder="Enter you Full Name"
              aria-invalid={touched.fullName && !!errors.fullName}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                touched.fullName && errors.fullName
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-100"
              }`}
            />
            {touched.fullName && errors.fullName && (
              <p
                id="fullName-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleInputChange}
              onBlur={() => handleBlur("age")}
              placeholder="Enter you Age"
              aria-invalid={touched.age && !!errors.age}
              aria-describedby={errors.age ? "age-error" : undefined}
              className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                touched.age && errors.age
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-100"
              }`}
            />
            {touched.age && errors.age && (
              <p
                id="age-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.age}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur("email")}
              placeholder="Enter you Email"
              aria-invalid={touched.email && !!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                touched.email && errors.email
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-100"
              }`}
            />
            {touched.email && errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label
              htmlFor="contactNumber"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Contact Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              onBlur={() => handleBlur("contactNumber")}
              placeholder="Enter you Phone Number"
              aria-invalid={touched.contactNumber && !!errors.contactNumber}
              aria-describedby={
                errors.contactNumber ? "contactNumber-error" : undefined
              }
              className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                touched.contactNumber && errors.contactNumber
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-100"
              }`}
            />
            {touched.contactNumber && errors.contactNumber && (
              <p
                id="contactNumber-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.contactNumber}</span>
              </p>
            )}
          </div>

          {/* Gender (Radio Buttons) */}
          <div className="md:col-span-2">
            <fieldset>
              <legend className="text-sm font-semibold text-slate-800 mb-2">
                Gender <span className="text-rose-500">*</span>
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {genderOptions.map((option) => (
                  <label
                    key={option}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.gender === option
                        ? "border-slate-900 bg-slate-50 text-slate-900 font-semibold shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900 focus:ring-offset-0"
                    />
                    <span className="text-xs sm:text-sm whitespace-nowrap">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {touched.gender && errors.gender && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.gender}</span>
              </p>
            )}
          </div>

          {/* Status (Dropdown) */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                onBlur={() => handleBlur("status")}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 transition-colors appearance-none pr-10 cursor-pointer"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {touched.status && errors.status && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.status}</span>
              </p>
            )}
          </div>

          {/* Address (Multiline Textarea) */}
          <div className="md:col-span-2">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              onBlur={() => handleBlur("address")}
              placeholder="Enter your Address"
              aria-invalid={touched.address && !!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 resize-y ${
                touched.address && errors.address
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-slate-300 focus:border-slate-900 focus:ring-slate-100"
              }`}
            />
            {touched.address && errors.address && (
              <p
                id="address-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Beneath Form */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{editingProfile ? "Update Profile" : "Save Profile"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};
