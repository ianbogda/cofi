import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Database,
  FileText,
  Plus,
  ShieldCheck,
  Upload
} from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_URL || '/api';

async function api(path: string, opts?: RequestInit) {
  const response = await fetch(`${API}${path}`, opts);
  const contentType = response.headers.get('content-type') || '';

  let data: any = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      `Erreur HTTP ${response.status} ${response.statusText}`
    );
  }

  return data;
}

type CofiCase = {
  id: number;
  uai: string;
  name: string;
  fiscal_year: number;
  status: string;
};

type Document = {
  original_filename: string;
};

type Requirement = {
  code: string;
  title: string;
  producer: string;
  document?: Document | null;
};

type SourceImport = {
  source_type: string;
  fiscal_year: number;
  row_count: number;
  filename: string;
};

type CaseDetail = CofiCase & {
  schema_version: string;
  requirements: Requirement[];
  imports: SourceImport[];
};

function App() {
  const [cases, setCases] = useState<CofiCase[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [error, setError] = useState('');

  const loadCases = useCallback(async () => {
    try {
      setError('');
      const result = await api('/cases');
      setCases(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    try {
      setError('');
      const result = await api(`/cases/${id}`);
      setDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }, []);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (selected === null) {
      setDetail(null);
      return;
    }

    void loadDetail(selected);
  }, [selected, loadDetail]);

  async function createCase() {
    const uai = prompt('UAI (8 caractères)');

    if (!uai) {
      return;
    }

    const name = prompt("Nom de l'établissement");

    if (!name) {
      return;
    }

    try {
      setError('');

      await api('/cases', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          uai,
          name,
          fiscalYear: 2025
        })
      });

      await loadCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  if (selected !== null && detail) {
    return (
      <CaseView
        data={detail}
        back={() => {
          setSelected(null);
          setDetail(null);
        }}
        reload={() => loadDetail(selected)}
      />
    );
  }

  return (
    <div className="shell">
      <header>
        <div>
          <span className="eyebrow">EPLE · Compte financier</span>
          <h1>Comptes financiers</h1>
          <p>Collecter, contrôler et préparer les dossiers COFI.</p>
        </div>

        <button className="primary" onClick={() => void createCase()}>
          <Plus size={17} />
          Nouveau dossier
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="cards">
        {cases.map((cofiCase) => (
          <button
            className="case-card"
            key={cofiCase.id}
            onClick={() => setSelected(cofiCase.id)}
          >
            <div className="icon">
              <Building2 />
            </div>

            <div>
              <strong>{cofiCase.name}</strong>
              <span>
                {cofiCase.uai} · Exercice {cofiCase.fiscal_year}
              </span>
            </div>

            <b>{cofiCase.status}</b>
          </button>
        ))}
      </section>

      {!cases.length && (
        <div className="empty">
          <FileText size={34} />
          <h2>Aucun dossier COFI</h2>
          <p>Créez le premier dossier 2025 pour commencer la collecte.</p>
        </div>
      )}
    </div>
  );
}

function CaseView({
  data,
  back,
  reload
}: {
  data: CaseDetail;
  back: () => void;
  reload: () => Promise<void>;
}) {
  const [error, setError] = useState('');

  const requirements = data.requirements || [];
  const imports = data.imports || [];

  const done = requirements.filter(
    (requirement) => requirement.document
  ).length;

  async function uploadDocument(
    requirement: Requirement,
    file: File
  ) {
    try {
      setError('');

      const formData = new FormData();
      formData.append('documentCode', requirement.code);
      formData.append('file', file);

      await api(`/cases/${data.id}/documents`, {
        method: 'POST',
        body: formData
      });

      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  async function uploadEblc(file: File, year: number) {
    try {
      setError('');

      const formData = new FormData();
      formData.append('fiscalYear', String(year));
      formData.append('file', file);

      await api(`/cases/${data.id}/imports/eblc`, {
        method: 'POST',
        body: formData
      });

      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  }

  return (
    <div className="shell">
      <button className="back" onClick={back}>
        <ArrowLeft size={16} />
        Tous les COFI
      </button>

      <header>
        <div>
          <span className="eyebrow">
            Compte financier {data.fiscal_year}
          </span>

          <h1>{data.name}</h1>

          <p>
            {data.uai} · Schéma {data.schema_version}
          </p>
        </div>

        <div className="progress">
          <strong>
            {done}/{requirements.length}
          </strong>
          <span>exigences satisfaites</span>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <section className="panel wide">
          <div className="panel-title">
            <div>
              <FileText />
              <h2>Dossier réglementaire</h2>
            </div>

            <span>
              {done === requirements.length
                ? 'Complet'
                : 'Collecte en cours'}
            </span>
          </div>

          <div className="requirements">
            {requirements.map((requirement) => (
              <div
                className="requirement"
                key={requirement.code}
              >
                {requirement.document ? (
                  <CheckCircle2 className="ok" />
                ) : (
                  <Circle />
                )}

                <div>
                  <strong>{requirement.title}</strong>
                  <small>
                    {requirement.code} · {requirement.producer}
                  </small>
                </div>

                {requirement.document ? (
                  <span className="file">
                    {requirement.document.original_filename}
                  </span>
                ) : (
                  <label className="soft">
                    <Upload size={14} />
                    Importer

                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          void uploadDocument(requirement, file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <Database />
              <h2>Données d'analyse</h2>
            </div>
          </div>

          {[data.fiscal_year, data.fiscal_year - 1].map((year) => {
            const sourceImport = imports.find(
              (item) =>
                item.source_type === 'EBLC' &&
                item.fiscal_year === year
            );

            return (
              <div className="source" key={year}>
                <div>
                  <strong>EBLC {year}</strong>

                  <small>
                    {sourceImport
                      ? `${sourceImport.row_count} lignes · ${sourceImport.filename}`
                      : 'Non importé'}
                  </small>
                </div>

                <label className="soft">
                  <Upload size={14} />
                  {sourceImport ? 'Remplacer' : 'Importer'}

                  <input
                    hidden
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        void uploadEblc(file, year);
                      }
                    }}
                  />
                </label>
              </div>
            );
          })}

          <div className="source muted">
            <div>
              <strong>YBALAC / YBALAF</strong>
              <small>Prévu en itération 2</small>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <ShieldCheck />
              <h2>Production</h2>
            </div>
          </div>

          <div className="production">
            <strong>
              {done === requirements.length
                ? 'Dossier documentaire complet'
                : 'Dossier incomplet'}
            </strong>

            <p>
              {requirements.length - done} exigence(s) applicable(s)
              restent à satisfaire.
            </p>

            <button className="primary" disabled>
              Générer le compte financier
            </button>

            <small>
              Activation prévue après annexe AC et assemblage PDF.
            </small>
          </div>
        </section>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);