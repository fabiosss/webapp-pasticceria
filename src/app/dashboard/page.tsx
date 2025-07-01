"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from 'lucide-react';
import Link from "next/link";
import { supabase } from '@/lib/supabase';
import Header from "@/components/Header";

interface Prodotto {
  id?: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  kg: number;
  preparazione: string;
  disponibilita: string;
  immagine: string;
  unita: 'kg' | 'pz';
}

export default function DashboardPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [ordini, setOrdini] = useState<any[]>([]);
  const [statistiche, setStatistiche] = useState<Record<string, number>>({});
  const [calendario, setCalendario] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState<Prodotto>({
    nome: '',
    descrizione: '',
    prezzo: 0,
    kg: 1,
    preparazione: '',
    disponibilita: '',
    immagine: '',
    unita: 'kg',
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("⚠️ Devi effettuare il login");
        window.location.href = "/login";
        return;
      }
      await fetchProdotti(user.id);
      await fetchOrdini();
    };
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    if (ordini.length > 0) {
      calcolaStatistiche();
    }
  }, [ordini]);

  useEffect(() => {
    if (ordini.length > 0) {
      calcolaCalendario();
    }
  }, [ordini]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'prezzo' || name === 'kg' ? parseFloat(value) : value,
    }));
  };

  const fetchProdotti = async (userId: string) => {
    const { data, error } = await supabase
      .from('prodotti')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) setProdotti(data);
  };

  const fetchOrdini = async () => {
    const { data, error } = await supabase
      .from('ordini')
      .select('*');

    if (!error && data) setOrdini(data);
  };

  const calcolaStatistiche = () => {
    const counter: Record<string, number> = {};

    ordini.forEach((ordine) => {
        ordine.prodotti.forEach((p: any) => {
          const nome = p.nome;
          const quantita = p.kg || 1;
          counter[nome] = (counter[nome] || 0) + quantita;
        });
      });

      setStatistiche(counter);
  };

  const calcolaCalendario = () => {
    const mappa: Record<string, number> = {};

    ordini.forEach((ordine) => {
      const data = ordine.dataConsegna;
      mappa[data] = (mappa[data] || 0) + 1;
    });

    setCalendario(mappa);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("⚠️ Utente non autenticato");
      return;
    }

    const { error } = await supabase
      .from('prodotti')
      .insert([{ ...formData, user_id: user.id }]);


    if (error) {
      console.error("❌ Errore Supabase durante insert:", error.message);
      alert("Errore durante l'inserimento del prodotto: " + error.message);
      return;
    }

    await fetchProdotti(user.id);

    setFormData({
      nome: '',
      descrizione: '',
      prezzo: 0,
      kg: 1,
      preparazione: '',
      disponibilita: '',
      immagine: '',
      unita: 'kg',
    });
  };

  const removeProduct = async (id?: string) => {
    if (!id) return;
    const { error } = await supabase.from('prodotti').delete().eq('id', id);
    if (error) {
      console.error("❌ Errore rimozione:", error.message);
      alert("Errore durante l'eliminazione del prodotto.");
      return;
    }
    setProdotti(prodotti.filter((p) => p.id !== id));
  };

  return (
    <div className="container">
      <Header />
        <h1 className="title">👩‍🍳 Dashboard Pasticcere</h1>

        <div className="dashboard-box">
          <div className="dashboard-box">
            <h2>📋 Riepilogo Ordini</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white shadow rounded p-4">
                <p className="text-sm text-gray-500">Totali</p>
                <p className="text-2xl font-bold text-pink-600">{ordini.length}</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <p className="text-sm text-gray-500">Da Fare</p>
                <p className="text-2xl font-bold text-orange-500">{ordini.filter(o => !o.completato).length}</p>
              </div>
              <div className="bg-white shadow rounded p-4">
                <p className="text-sm text-gray-500">Completati</p>
                <p className="text-2xl font-bold text-green-600">{ordini.filter(o => o.completato).length}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-box">
            <h2>📊 Prodotti più ordinati</h2>
            {Object.keys(statistiche).length === 0 ? (
              <p className="text-gray-500">Nessun dato disponibile.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(statistiche)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([nome, quantita], i) => (
                    <li key={i} className="flex justify-between bg-white rounded-md p-3 shadow">
                      <span>{nome}</span>
                      <span className="font-bold text-pink-700">{quantita}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="dashboard-box">
            <h2>📅 Calendario consegne</h2>
            {Object.keys(calendario).length === 0 ? (
              <p className="text-gray-500">Nessuna consegna pianificata.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(calendario)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([data, count], i) => (
                    <li key={i} className="flex justify-between bg-white rounded-md p-3 shadow">
                      <span>{new Date(data).toLocaleDateString('it-IT')}</span>
                      <span className="text-pink-700 font-bold">{count} ordine{count > 1 ? 'i' : ''}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="dashboard-box">
            <h2>Aggiungi nuovo prodotto</h2>
            <form onSubmit={handleSubmit} className="dashboard-form">
              <input name="nome" value={formData.nome} onChange={handleChange}
                placeholder="Esempio: Torta Millefoglie" required />

              <input name="prezzo" type="number" value={formData.prezzo} onChange={handleChange} placeholder={`Prezzo al ${formData.unita === 'pz' ? 'pezzo' : 'kg'} (€)`} required/>
              <select name="unita" value={formData.unita} onChange={(e) => setFormData({ ...formData, unita: e.target.value as 'kg' | 'pz' })} required>
                <option value="">Seleziona unità</option>
                <option value="kg">Prezzo al kg</option>
                <option value="pz">Prezzo a pezzo</option>
              </select>
              <input name="kg" type="number" value={formData.kg} onChange={handleChange} placeholder="Quantità minima (es. 1)" required  />
              <input name="preparazione" value={formData.preparazione} onChange={handleChange} placeholder="Tempo di preparazione (es. 24h)" required  />
              <input name="disponibilita" value={formData.disponibilita} onChange={handleChange} placeholder="Disponibile (es. Sempre / Week-end)" required  />
              <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} placeholder="Descrizione breve del dolce..." required  />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      setFormData((prev) => ({
                        ...prev,
                        immagine: base64,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <button type="submit" >
                <Plus size={18} /> Aggiungi Prodotto
              </button>
            </form>
          </div>
        </div>

        
        <div className="dashboard-box">
          <h2>Prodotti inseriti</h2>
          <div className="dashboard-grid">
            {prodotti.map((p, index) => (
              <div key={p.id || index} className="bg-white shadow-md rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    {p.immagine && (
                      <img src={p.immagine} alt={p.nome} className="mb-3 rounded-md w-full h-40 object-cover" />
                    )}
                    <h3 className="text-lg font-bold text-gray-800">{p.nome}</h3>
                    <p className="text-sm text-gray-600 mb-2">{p.descrizione}</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><strong>Prezzo:</strong> €{p.prezzo} /{p.unita}</li>
                      <li><strong>Minimo:</strong> {p.kg} {p.unita}</li>
                      <li><strong>Preparazione:</strong> {p.preparazione}</li>
                      <li><strong>Disponibilità:</strong> {p.disponibilita}</li>
                    </ul>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="button danger">
                    <Trash2 size={18} /> Rimuovi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}