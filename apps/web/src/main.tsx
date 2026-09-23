import React, {
  useEffect,
  useState
} from 'react';
import {
  createRoot
} from 'react-dom/client';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  Database,
  ShieldCheck,
  Plus
} from 'lucide-react';
import './style.css';
const API = import.meta.env.VITE_API_URL || '/api';
async function api(path: string, opts ? : RequestInit) {
  const r = await fetch(`${API}${path}`, opts);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Erreur');
  return j
}
type Case = {
  id: number;uai: string;name: string;fiscal_year: number;status: string
};

function App() {
  const [cases, setCases] = useState < Case[] > ([]), [selected, setSelected] = useState < number | null > (null), [detail, setDetail] = useState < any > (null), [error, setError] = useState('');
  const load = () => api('/cases').then(setCases).catch(e => setError(e.message));
  useEffect(load, []);
  useEffect(() => {
    if (selected) api(`/cases/${selected}`).then(setDetail)
  }, [selected]);
  async function create() {
    const uai = prompt('UAI (8 caractères)');
    if (!uai) return;
    const name = prompt('Nom de l’établissement');
    if (!name) return;
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
    load()
  }
  if (selected && detail) return < CaseView data = {
    detail
  }
  back = {
    () => {
      setSelected(null);
      setDetail(null)
    }
  }
  reload = {
    () => api(`/cases/${selected}`).then(setDetail)
  }
  />;
  return < div className = "shell" > < header > < div > < span className = "eyebrow" > EPLE· Compte financier < /span><h1>Comptes financiers</h1 > < p > Collecter, contrôler et préparer les dossiers COFI. < /p></div > < button className = "primary"
  onClick = {
    create
  } > < Plus size = {
    17
  }
  />Nouveau dossier</button > < /header>{error&&<div className="error">{error}</div >
} < section className = "cards" > {
  cases.map(c => < button className = "case-card"
    key = {
      c.id
    }
    onClick = {
      () => setSelected(c.id)
    } > < div className = "icon" > < Building2 / > < /div><div><strong>{c.name}</strong > < span > {
      c.uai
    }·
    Exercice {
      c.fiscal_year
    } < /span></div > < b > {
      c.status
    } < /b></button > )
} < /section>{!cases.length&&<div className="empty"><FileText size={34}/ > < h2 > Aucun dossier COFI < /h2><p>Créez le premier dossier 2025 pour commencer la collecte.</p > < /div>}</div >
}

function CaseView({
  data,
  back,
  reload
}: {
  data: any;back: () => void;reload: () => void
}) {
  const req = data.requirements || [],
    done = req.filter((r: any) => r.document).length,
    imports = data.imports || [];
  async function uploadDoc(r: any, file: File) {
    const fd = new FormData();
    fd.append('documentCode', r.code);
    fd.append('file', file);
    await api(`/cases/${data.id}/documents`, {
      method: 'POST',
      body: fd
    });
    reload()
  }
  async function uploadEblc(file: File, year: number) {
    const fd = new FormData();
    fd.append('fiscalYear', String(year));
    fd.append('file', file);
    await api(`/cases/${data.id}/imports/eblc`, {
      method: 'POST',
      body: fd
    });
    reload()
  }
  return < div className = "shell" > < button className = "back"
  onClick = {
    back
  } > < ArrowLeft size = {
    16
  }
  />Tous les COFI</button > < header > < div > < span className = "eyebrow" > Compte financier {
    data.fiscal_year
  } < /span><h1>{data.name}</h1 > < p > {
    data.uai
  }·
  Schéma {
    data.schema_version
  } < /p></div > < div className = "progress" > < strong > {
    done
  }
  /{req.length}</strong > < span > exigences satisfaites < /span></div > < /header><div className="grid"><section className="panel wide"><div className="panel-title"><div><FileText/ > < h2 > Dossier réglementaire < /h2></div > < span > {
      done === req.length ? 'Complet' : 'Collecte en cours'
    } < /span></div > < div className = "requirements" > {
      req.map((r: any) => < div className = "requirement"
        key = {
          r.code
        } > {
          r.document ? < CheckCircle2 className = "ok" / > : < Circle / >
        } < div > < strong > {
          r.title
        } < /strong><small>{r.code} · {r.producer}</small > < /div>{r.document?<span className="file">{r.document.original_filename}</span >: < label className = "soft" > < Upload size = {
          14
        }
        />Importer<input type="file" accept="application/pdf
        " hidden onChange={e=>e.target.files?.[0]&&uploadDoc(r,e.target.files[0])}/></label>}</div>)}</div></section><section className="
        panel "><div className="
        panel - title "><div><Database/><h2>Données d'analyse</h2></div></div>{[2025,2024].map(y=>{const i=imports.find((x:any)=>x.source_type==='EBLC'&&x.fiscal_year===y);return <div className="
        source " key={y}><div><strong>EBLC {y}</strong><small>{i?`${i.row_count} lignes · ${i.filename}`:'Non importé'}</small></div><label className="
        soft "><Upload size={14}/>{i?'Remplacer':'Importer'}<input hidden type="
        file " accept=".csv, text / csv " onChange={e=>e.target.files?.[0]&&uploadEblc(e.target.files[0],y)}/></label></div>})}<div className="
        source muted "><div><strong>YBALAC / YBALAF</strong><small>Prévu en itération 2</small></div></div></section><section className="
        panel "><div className="
        panel - title "><div><ShieldCheck/><h2>Production</h2></div></div><div className="
        production "><strong>{done===req.length?'Dossier documentaire complet':'Dossier incomplet'}</strong><p>{req.length-done} exigence(s) applicable(s) restent à satisfaire.</p><button className="
        primary " disabled>Générer le compte financier</button><small>Activation prévue après annexe AC et assemblage PDF.</small></div></section></div></div>}
        createRoot(document.getElementById('root') !).render( < App / > );