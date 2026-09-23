export type CofiStatus='DRAFT'|'COLLECTING'|'ANALYSING'|'ANNEX_PREPARATION'|'READY'|'GENERATED'|'ARCHIVED';
export type DocumentStatus='MISSING'|'IMPORTED'|'VALIDATED'|'SUPERSEDED';
export type Requirement='ALWAYS'|'IF_EXISTS'|'IF_ACCOUNTANT_CHANGED'|'IF_REQUISITION'|'IF_PCHD'|'IF_CAP'|'IF_AUDIT'|'POST_COFI';
export type Producer='OPALE'|'ORDONNATEUR'|'ACCOUNTANT'|'CA'|'OTHER';
export interface DocumentRequirement {code:string;title:string;producer:Producer;requirement:Requirement;order:number;includeInFinalPdf:boolean;}
export interface CofiSchema {id:string;version:string;fiscalYear:number;documents:DocumentRequirement[];}
