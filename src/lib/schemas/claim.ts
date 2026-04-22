import { z } from "zod";

const towingServiceSchema = z.object({
  title: z.literal("Towing Service"),
  status: z.string(),
  pickupLocation: z.string(),
  towingDate: z.string(),
});

const claimNotificationSchema = z.object({
  title: z.literal("Claim Notification"),
  status: z.string(),
  dateTime: z.string(),
  reportType: z.string(),
  reasonForDamage: z.string(),
  reportingParty: z.string(),
  contact: z.string(),
});

const appraisalSchema = z.object({
  title: z.literal("Appraisal"),
  status: z.string(),
  expertAssignmentDate: z.string(),
  expertInfo: z.string(),
  contact: z.string(),
});

const substituteRentalVehicleSchema = z.object({
  title: z.literal("Substitute Rental Vehicle"),
  status: z.string(),
  vehicleDuration: z.string(),
  vehicleModel: z.string(),
  extraDuration: z.string(),
});

const fileReviewSchema = z.object({
  title: z.literal("File Review"),
  status: z.string(),
  reviewReferralDate: z.string(),
  reviewCompletionDate: z.string(),
});

const deductionReasonSchema = z.object({
  title: z.literal("Deduction Reason"),
  status: z.string(),
  actionRequired: z.string(),
  occupationalDeduction: z.string(),
  appreciationDeduction: z.string(),
  policyDeductible: z.string(),
  nonDamageAmount: z.string(),
});

const paymentInformationSchema = z.object({
  title: z.literal("Payment Information"),
  status: z.string(),
  paidTo: z.string(),
  iban: z.string(),
  paymentAmount: z.string(),
  note: z.string(),
});

const closedSchema = z.object({
  title: z.literal("Closed"),
  status: z.string(),
  completionDate: z.string(),
});

export const processDetailSchema = z.discriminatedUnion("title", [
  towingServiceSchema,
  claimNotificationSchema,
  appraisalSchema,
  substituteRentalVehicleSchema,
  fileReviewSchema,
  deductionReasonSchema,
  paymentInformationSchema,
  closedSchema,
]);

export const claimResponseSchema = z.object({
  title: z.literal("Claim Process"),
  fileNo: z.string(),
  estimatedRemainingTime: z.string(),
  currentStatus: z.string(),
  processDetails: z.array(processDetailSchema),
});

export type ProcessDetail = z.infer<typeof processDetailSchema>;
export type ClaimResponse = z.infer<typeof claimResponseSchema>;
