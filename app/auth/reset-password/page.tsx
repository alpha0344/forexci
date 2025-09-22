"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation côté client
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La confirmation du mot de passe est requise";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        // Rediriger vers l'accueil après 3 secondes
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setErrors({
          general: data.error || "Erreur lors de la réinitialisation",
        });
      }
    } catch (error) {
      setErrors({ general: "Erreur de connexion" });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si le token est présent
  if (!token) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-brand-red" />
            <h2 className="mt-6 text-3xl font-extrabold text-brand-anthracite">
              Lien invalide
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Le lien de réinitialisation de mot de passe est invalide ou a
              expiré.
            </p>
            <div className="mt-6">
              <Link href="/" className="link-blue font-medium">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-brand-anthracite">
              Mot de passe réinitialisé !
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Votre mot de passe a été réinitialisé avec succès. Vous êtes
              maintenant connecté.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Redirection vers l'accueil dans quelques secondes...
            </p>
            <div className="mt-6">
              <Link href="/" className="link-blue font-medium">
                Accéder à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-anthracite">
            Réinitialiser votre mot de passe
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Saisissez votre nouveau mot de passe ci-dessous
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-brand-anthracite mb-2"
              >
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors ${
                    errors.password
                      ? "border-brand-red"
                      : "border-brand-gray-dark"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-brand-anthracite"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-brand-red text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                Au moins 6 caractères avec une majuscule, minuscule et un
                chiffre
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-brand-anthracite mb-2"
              >
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors ${
                    errors.confirmPassword
                      ? "border-brand-red"
                      : "border-brand-gray-dark"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-brand-anthracite"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-brand-red text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-brand-red rounded-lg p-3">
                <p className="text-brand-red-dark text-sm">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-login w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="link-blue font-medium">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
