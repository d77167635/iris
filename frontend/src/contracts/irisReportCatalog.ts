export type IrisReportCatalogProduct = {
  reportId: string;
  version: string;
  analysisId: string;
  name: string;
  description: string;
  family: string;
  outputType: string;
  requiredEvidenceInputs: string[];
};

export type IrisReportCatalogUserReport = {
  id: string;
  report_id: string;
  run_id: string;
  execution_id: string;
  title: string;
  description: string;
  primary_content_kind: string;
  primary_content_id: string;
  content_node_ids: string[];
  source_evidence_ids: string[];
  source_report_ids: string[];
  content: Record<string, unknown>;
  composition: Record<string, unknown>;
  composition_hash: string;
  certification_hash: string;
  status: "PUBLISHED" | "RETIRED";
  created_at: string;
  updated_at: string;
};

export type IrisReportCatalogActivationMode = "all_available" | "explicit";
export type IrisReportDependencyResolutionState = "definition_only";

export type IrisReportDependency = {
  report_id: string;
  analysis_definition_id: string;
  feature_ids: string[];
  required_evidence_keys: string[];
  resolution_state: IrisReportDependencyResolutionState;
  upstream_intelligence_node_ids: string[];
};

export type IrisReportCatalogResponse = {
  catalog_version: string;
  product_boundary: string;
  provider_boundary: string;
  catalog: IrisReportCatalogProduct[];
  user_reports: IrisReportCatalogUserReport[];
  dependency_graph: IrisReportDependency[];
  activation: {
    mode: IrisReportCatalogActivationMode;
    count: number;
    report_ids: string[];
  };
  catalog_counts: {
    total: number;
    active: number;
    families: number;
    user_reports: number;
  };
};
