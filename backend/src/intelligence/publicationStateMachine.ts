export type PublicationStatus = "NOT_STARTED" | "HIERARCHY_PENDING" | "HIERARCHY_PUBLISHED" | "REPORT_PENDING" | "PUBLISHED" | "FAILED";
export type PublicationFailureCode = "HIERARCHY_PUBLICATION_FAILED" | "REPORT_PUBLICATION_FAILED" | "PUBLICATION_STATE_PERSISTENCE_FAILED";
export type RetryTarget = "HIERARCHY" | "REPORT";

export function isPublicationFailureCode(value: string): value is PublicationFailureCode {
  return value === "HIERARCHY_PUBLICATION_FAILED" || value === "REPORT_PUBLICATION_FAILED" || value === "PUBLICATION_STATE_PERSISTENCE_FAILED";
}

export function retryTargetForFailure(status: PublicationStatus, errorCode: PublicationFailureCode, hierarchyPublished: boolean): RetryTarget | null {
  if (status !== "FAILED") return null;
  if (errorCode === "REPORT_PUBLICATION_FAILED" && hierarchyPublished) return "REPORT";
  if (errorCode === "HIERARCHY_PUBLICATION_FAILED" && !hierarchyPublished) return "HIERARCHY";
  if (errorCode === "PUBLICATION_STATE_PERSISTENCE_FAILED" && !hierarchyPublished) return "HIERARCHY";
  if (errorCode === "PUBLICATION_STATE_PERSISTENCE_FAILED" && hierarchyPublished) return "REPORT";
  return null;
}

export function retryPredecessor(target: RetryTarget): PublicationStatus {
  return target === "HIERARCHY" ? "HIERARCHY_PENDING" : "REPORT_PENDING";
}

export function publicationFailurePreservesCertification(status: PublicationStatus, certificationStatus: string, validationStatus: string): boolean {
  return status === "FAILED" && certificationStatus === "CERTIFIED" && validationStatus === "PASS";
}
