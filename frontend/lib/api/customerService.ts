/**
 * Customer service — addresses are embedded in the auth model.
 * NO separate /customers/addresses endpoint exists.
 * All address operations go through /auth/user/address/*
 *
 * This file is kept for backwards compatibility — it re-exports from authService.
 */

export {
  getProfileApi as getMeApi,
  updateProfileApi as updateMeApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
} from "@/lib/api/authService";
