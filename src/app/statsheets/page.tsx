import { headers, cookies } from "next/headers";

export default async function Statsheets() {
    const hdrs = await headers();
    const mwHeader = hdrs.get('x-offsyde-mw');
    const cookieStore = await cookies();
    const mwCookie = cookieStore.get('offsyde_mw')?.value;
    const isOn = Boolean(mwHeader || mwCookie);
    return (
        <div className="p-6 mx-auto mt-10 max-w-6xl">
            <h1 className="text-4xl font-bold">Statsheets</h1>
            <p className="mt-4 text-lg text-neutral-400">A brief report of your tested routes and their performance metrics.</p>
            <div className="inline-flex items-center gap-2 mt-6 px-3 py-1 text-sm bg-black/40 rounded-md border-neutral-800 border">
                <span className="text-neutral-400">Middleware:</span>
                <span className={isOn ? 'text-emerald-400' : 'text-rose-400'}>{isOn ? 'ON' : 'OFF'}</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500">
                <p>hdr x-offsyde-mw: {mwHeader ?? 'null'}</p>
                <p>cookie offsyde_mw: {mwCookie ?? 'null'}</p>
            </div>
        </div>
    );
}
