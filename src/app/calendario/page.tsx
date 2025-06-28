'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Ordine {
  id: string;
  nomeCliente: string;
  dataConsegna: string;
  prodotti: any[];
  telefono: string;
  note?: string;
}

export default function CalendarioOrdini() {
  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchOrdini = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      const ADMIN_ID = '56670e09-1dde-4e77-b500-82245a5e3ede'; // 🔁 Sostituisci con il tuo vero ID admin

      if (error || !user || user.id !== ADMIN_ID) {
        alert('⛔ Accesso negato');
        window.location.href = '/login';
        return;
      }

      const { data, error: ordiniError } = await supabase
        .from('ordini')
        .select('*')
        .order('dataConsegna', { ascending: true });

      if (!ordiniError && data) {
        setOrdini(data);
      }
    };

    fetchOrdini();
  }, []);

  const ordiniPerData = (date: Date) => {
    const dataString = format(date, 'yyyy-MM-dd');
    return ordini.filter(o => o.dataConsegna === dataString);
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dataString = format(date, 'yyyy-MM-dd');
      const haOrdini = ordini.some(o => o.dataConsegna === dataString);
      if (haOrdini) return 'has-order';
    }
    return null;
  };


  return (
    <div className="container">
      <h1 className="title">📅 Calendario Ordini</h1>

      <Calendar onClickDay={setSelectedDate} tileClassName={tileClassName} />

      {selectedDate && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Ordini per il {format(selectedDate, 'dd/MM/yyyy')}
          </h2>
          <div className="mt-4 space-y-4">
            {ordiniPerData(selectedDate).length === 0 ? (
              <p className="text-gray-500">Nessun ordine per questa data.</p>
            ) : (
              ordiniPerData(selectedDate).map((o) => {
                const domani = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
                const isDomani = o.dataConsegna === domani;

                return (
                  <div key={o.id} className="ordine-card border-l-4 border-amber-400 pl-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg text-[#5A3B29]">🧁 {o.nomeCliente}</h3>
                    {isDomani && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        🚚 In consegna domani
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-700 space-y-1 mb-2">
                    <p>📞 <strong>{o.telefono}</strong></p>
                    <p className="italic">📝 {o.note || '—'}</p>
                  </div>

                  <ul className="text-sm text-[#4B2E2E] mt-2 space-y-1 list-disc list-inside">
                    {o.prodotti.map((p: any, i: number) => (
                      <li key={i}>🍰 {p.nome} – {p.kg} {p.unita} – €{p.prezzo}/{p.unita}</li>
                    ))}
                  </ul>
                </div>
                );
              })


            )}
          </div>
        </div>
      )}
    </div>
  );
}
