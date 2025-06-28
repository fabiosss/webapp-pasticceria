'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface OrdineMultiplo {
  nomeCliente: string;
  telefono: string;
  dataConsegna: string;
  prodotti: any[];
  messaggio?: string;
  fascia_oraria?: string;
  note?: string;
}

export default function CarrelloPage() {
  const [carrello, setCarrello] = useState<any[]>([]);
  const [form, setForm] = useState<OrdineMultiplo>({
    nomeCliente: '',
    telefono: '',
    dataConsegna: '',
    prodotti: [],
    messaggio: '',
    fascia_oraria: '',
    note: '',
  });
  const [inviato, setInviato] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('carrello');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCarrello(parsed);
      setForm((prev) => ({ ...prev, prodotti: parsed }));
    }
  }, []);

  const rimuovi = (index: number) => {
    const nuovo = [...carrello];
    nuovo.splice(index, 1);
    setCarrello(nuovo);
    setForm((prev) => ({ ...prev, prodotti: nuovo }));
    localStorage.setItem('carrello', JSON.stringify(nuovo));
  };

  const totale = carrello.reduce((sum, p) => sum + p.prezzo * (p.kg || 1), 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('ordini').insert([
        {
          nomeCliente: form.nomeCliente,
          telefono: form.telefono,
          dataConsegna: form.dataConsegna,
          prodotti: form.prodotti,
          messaggio: form.messaggio,
          fascia_oraria: form.fascia_oraria,
          note: form.note,
        }
      ]);

      if (error) {
        console.error("❌ Errore Supabase:", error.message, error.details);
        alert("Errore durante l'invio dell'ordine: " + error.message);
        return;
      }

      // ✅ Reset stato e pulizia
      localStorage.removeItem('carrello');
      setCarrello([]);
      setForm({ nomeCliente: '', telefono: '', dataConsegna: '', prodotti: [] });
      setInviato(true);
    } catch (err) {
      console.error("❌ Errore generico:", err);
      alert("Errore inatteso durante l'invio dell'ordine.");
    }
  };



  return (
    <div className="carrello-container">
      <h1 className="carrello-titolo">🛒 Il tuo carrello</h1>

      {inviato && (
        <div className="mb-4 text-green-600 font-medium">
          ✅ Ordine inviato! Verrai ricontattato.
        </div>
      )}

      {carrello.length === 0 ? (
        <p className="text-gray-500">Il carrello è vuoto.</p>
      ) : (
        <>
          <ul className="carrello-lista space-y-4 mb-6">
            {carrello.map((item, i) => (
              <li key={i} className="bg-white p-4 rounded shadow flex justify-between items-center gap-4">
                {item.immagine && (
                  <img
                    src={item.immagine}
                    alt={item.nome}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-sm text-gray-600">
                    {item.kg} {item.unita === 'pz' ? 'pezzi' : 'kg'} – €{item.prezzo}/{item.unita}
                  </p>
                </div>
                <button onClick={() => rimuovi(i)} className="text-red-600 hover:text-red-800">
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">Totale:</span>
            <span className="text-xl text-green-600 font-bold">€{totale.toFixed(2)}</span>
          </div>

          <form onSubmit={handleSubmit} className="carrello-form space-y-4 mt-6">
            <h2 className="text-lg font-semibold">📦 Completa il tuo ordine</h2>
            <input
              name="nomeCliente"
              value={form.nomeCliente}
              onChange={handleChange}
              placeholder="Nome completo"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Telefono"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              name="dataConsegna"
              value={form.dataConsegna}
              onChange={handleChange}
              type="date"
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <select
              name="fascia_oraria"
              value={form.fascia_oraria}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Seleziona fascia oraria</option>
              <option value="Mattina (8-12)">Mattina (8-12)</option>
              <option value="Pomeriggio (14-18)">Pomeriggio (14-18)</option>
            </select>
            <textarea
              name="messaggio"
              value={form.messaggio}
              onChange={handleChange}
              placeholder="Messaggio sulla torta (es. Buon Compleanno Luca!)"
              className="w-full px-4 py-2 border rounded-md"
            />
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Note o allergie (es. senza lattosio, no fragole...)"
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
            >
              Invia ordine
            </button>
          </form>
        </>
      )}
    </div>
  );
}
