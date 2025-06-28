'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function OrdiniPage() {
  interface Ordine {
    id: string;
    nomeCliente: string;
    telefono: string;
    dataConsegna: string;
    prodotti: Prodotto[];
    note?: string;
    completato?: boolean;
  }

  interface Prodotto {
    nome: string;
    prezzo: number;
    unita: 'kg' | 'pz';
    kg: number;
    immagine?: string;
  }

  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [filtro, setFiltro] = useState<'tutti' | 'completati' | 'daFare'>('tutti');

  const ordiniFiltrati = ordini.filter((o) => {
    if (filtro === 'completati') return o.completato === true;
    if (filtro === 'daFare') return !o.completato;
    return true;
  });

  useEffect(() => {
    const fetchOrdini = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("⚠️ Accesso riservato. Effettua il login.");
        window.location.href = "/login";
        return;
      }

      const ADMIN_ID = '56670e09-1dde-4e77-b500-82245a5e3ede';
      if (user.id !== ADMIN_ID) {
        alert("⛔ Accesso negato.");
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase
        .from('ordini')
        .select('*')
        .order('dataConsegna', { ascending: true });

      if (!error && data) setOrdini(data);
    };

    fetchOrdini();
  }, []);

  const rimuoviOrdine = async (id: string) => {
    const { error } = await supabase.from('ordini').delete().eq('id', id);
    if (!error) setOrdini(prev => prev.filter(o => o.id !== id));
  };

  const toggleCompletato = async (id: string, statoAttuale: boolean) => {
    const { data, error } = await supabase
      .from('ordini')
      .update({ completato: !statoAttuale })
      .eq('id', id)
      .select();

    if (!error && data && data.length > 0) {
      setOrdini(prev => prev.map(o => o.id === id ? { ...o, completato: !statoAttuale } : o));
    }
  };

  const domani = new Date();
  domani.setDate(domani.getDate() + 1);
  const dataDomani = domani.toISOString().split('T')[0];
  const countDaFare = ordini.filter(o => !o.completato).length;

  return (
    <div className="min-h-screen bg-[#fdf9f6] p-6">
      <Header />

      <div className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#5A3B29] mb-2">📋 Ordini Ricevuti</h1>
        <Link href="/dashboard" className="text-sm text-orange-700 hover:underline">← Torna alla Dashboard</Link>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        {(['tutti', 'daFare', 'completati'] as const).map((tipo) => {
          const attivo = filtro === tipo;

          return (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-4 py-2 text-sm font-semibold rounded-full shadow-md transition border ${
                attivo
                  ? 'bg-orange-200 text-orange-900 border-orange-400'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {tipo === 'daFare' ? (
                <span className="flex items-center gap-2">
                  Da fare
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{countDaFare}</span>
                </span>
              ) : tipo === 'tutti' ? 'Tutti' : 'Completati'}
            </button>
          );
        })}
      </div>


      <div className="ordini-container">
        {ordiniFiltrati.length === 0 ? (
          <p className="text-center text-gray-500">Nessun ordine da mostrare.</p>
        ) : (
          <div className="space-y-6">
            {ordiniFiltrati.map((ordine) => {
              const isDomani = ordine.dataConsegna === dataDomani;

              return (
                <div
                  key={ordine.id}
                  className={`ordine-card ${isDomani ? 'border-yellow-400 bg-yellow-50' : 'border-orange-200 bg-white'}`}
                >
                  <div className="ordine-header">
                    <h2 className="text-xl font-bold text-[#5A3B29] flex items-center gap-2">
                      🧁 Ordine di {ordine.nomeCliente}
                    </h2>
                    {isDomani && (
                      <span className="ordine-label">🚚 Consegna domani</span>
                    )}
                  </div>

                  <p className="ordine-info">📞 {ordine.telefono} • 📅 {ordine.dataConsegna}</p>

                  <ul className="ordine-prodotti">
                    {ordine.prodotti.map((p, idx) => (
                      <li key={idx}>
                        {p.immagine && (
                          <img src={p.immagine} alt={p.nome} />
                        )}
                        <div>
                          🍰 <strong>{p.nome}</strong><br />
                          {p.kg} {p.unita === 'pz' ? 'pezzi' : 'kg'} – €{p.prezzo}/{p.unita}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {ordine.note && (
                    <p className="ordine-note">📝 {ordine.note}</p>
                  )}

                  <div className="ordine-actions">
                    <button
                      onClick={() => toggleCompletato(ordine.id, ordine.completato || false)}
                      className={`button ${ordine.completato ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`}
                    >
                      {ordine.completato ? '↩️ Annulla completamento' : '✅ Segna come completato'}
                    </button>

                    <button
                      onClick={() => rimuoviOrdine(ordine.id)}
                      className="button danger"
                      title="Elimina ordine"
                    >
                      <Trash2 size={18} /> Elimina
                    </button>
                  </div>

                  {ordine.completato && (
                    <p className="mt-2 text-green-700 text-sm">✔️ Ordine completato</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
