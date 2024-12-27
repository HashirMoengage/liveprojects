// interfaces.ts

export interface ProjectField {
  fieldId: number;
  fieldValueLabel: string;
}

export interface Owner {
  firstName: string;
  lastName: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  owner: Owner;
  fields: ProjectField[];
}

export interface SimplifiedProject {
  projectId: string;
  projectName: string;
  // ownerFullName: string;
  implementationManager: string;
  projectManager: string;
  currentStatus: string;
  scopeOfWork: string;
}