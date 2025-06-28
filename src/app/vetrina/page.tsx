'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Prodotto {
  id: string;
  nome: string;
  descrizione: string;
  prezzo: number;
  kg: number;
  preparazione: string;
  disponibilita: string;
  immagine?: string;
  unita: 'kg' | 'pz';
}

export default function Vetrina() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [carrello, setCarrello] = useState<Prodotto[]>([]);

  useEffect(() => {
    const salvato = localStorage.getItem('carrello');
    if (salvato) {
      setCarrello(JSON.parse(salvato));
    }
  }, []);

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('prodotti')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Errore nel recupero prodotti:", error.message);
      } else {
        setProdotti(data);
      }
    };

    fetchProdotti();
  }, []);

  const aggiungiACarrello = (prodotto: Prodotto) => {
    const aggiornato = [...carrello, prodotto];
    setCarrello(aggiornato);
    localStorage.setItem('carrello', JSON.stringify(aggiornato));
    alert('✅ Aggiunto al carrello!');
  };

  return (
    <div className="container">
      <h1 className="title">🍰 La Nostra Vetrina</h1>
      <div className="grid">
        {prodotti.map((p, i) => (
          <div key={p.id || i} className="card">
            {p.immagine && (
              <img
                src={p.immagine}
                alt={`Foto di ${p.nome}`}
                className="card-img"
              />
            )}
            <div className="card-content">
              <h2>{p.nome}</h2>
              <p>{p.descrizione}</p>
              <ul>
                <li><strong>Prezzo:</strong> €{p.prezzo} / {p.unita}</li>
                <li><strong>Minimo:</strong> {p.kg} {p.unita}</li>
                <li><strong>Preparazione:</strong> {p.preparazione}</li>
                <li><strong>Disponibilità:</strong> {p.disponibilita}</li>
              </ul>
              <button onClick={() => aggiungiACarrello(p)} className="button">
                ➕ Aggiungi al carrello
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
