'use client';
import { useState } from "react";
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Prodotto {
  nome: string;
  descrizione: string;
  prezzo: number;
  kg: number;
  preparazione: string;
  disponibilita: string;
}

export default function Dashboard() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [formData, setFormData] = useState<Prodotto>({
    nome: "",
    descrizione: "",
    prezzo: 0,
    kg: 1,
    preparazione: "",
    disponibilita: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'prezzo' || name === 'kg' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProdotti([...prodotti, formData]);
    setFormData({ nome: "", descrizione: "", prezzo: 0, kg: 1, preparazione: "", disponibilita: "" });
  };

  const removeProduct = (index: number) => {
    const updated = [...prodotti];
    updated.splice(index, 1);
    setProdotti(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-right">
          <Link href="/vetrina">
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">
              Vai alla Vetrina
            </button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestione Prodotti</h1>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Aggiungi nuovo prodotto</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome dolce" required className="px-4 py-2 border rounded-md" />
            <input name="prezzo" type="number" value={formData.prezzo} onChange={handleChange} placeholder="Prezzo al kg (€)" required className="px-4 py-2 border rounded-md" />
            <input name="kg" type="number" value={formData.kg} onChange={handleChange} placeholder="Kg minimo" required className="px-4 py-2 border rounded-md" />
            <input name="preparazione" value={formData.preparazione} onChange={handleChange} placeholder="Tempo di preparazione" required className="px-4 py-2 border rounded-md" />
            <input name="disponibilita" value={formData.disponibilita} onChange={handleChange} placeholder="Disponibilità" required className="px-4 py-2 border rounded-md" />
            <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} placeholder="Descrizione" required className="px-4 py-2 border rounded-md md:col-span-2" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 md:col-span-2">
              <Plus size={18} /> Aggiungi Prodotto
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Prodotti inseriti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prodotti.map((p, index) => (
              <div key={index} className="bg-white shadow-md rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{p.nome}</h3>
                    <p className="text-sm text-gray-600 mb-2">{p.descrizione}</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><strong>Prezzo:</strong> €{p.prezzo} /kg</li>
                      <li><strong>Minimo:</strong> {p.kg} kg</li>
                      <li><strong>Preparazione:</strong> {p.preparazione}</li>
                      <li><strong>Disponibilità:</strong> {p.disponibilita}</li>
                    </ul>
                  </div>
                  <button onClick={() => removeProduct(index)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
