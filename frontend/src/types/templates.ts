export type TemplateSummary = {
  id: string;
  name: string;
  subject: string;
  variables: string[];
  created_at: string;
  updated_at: string;
};

export type Template = TemplateSummary & {
  html_body: string;
  unknown_variables: string[];
};

export type TemplateCreatePayload = {
  name: string;
  subject: string;
  html_body: string;
};

export type TemplateUpdatePayload = Partial<TemplateCreatePayload>;

export type Preview = {
  subject: string;
  html_body: string;
};
