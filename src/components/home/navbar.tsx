
import Link from "next/link";

const links=[{
    name:"Scoutings",
    path:"/scoutings"
},
{
    name:"Audits",
    path:"/audits"
},
{
    name:"FrontLine",
    path:"/frontLine"
},
{
    name:"Playmaker",
    path:"/playmaker"
},{
    name:"Statsheets",
    path:"/reports"
}]
export default function Navbar() {
    return (
        <div className="z-50 sticky top-0 flex justify-between items-center gap-4 mx-auto my-4 max-w-3xl h-14 bg-white/5 rounded-[150px] border-neutral-500 shadow-md backdrop-blur-3xl border">
            <div className="ml-10 font-bold text-2xl"> 
                <Link href="/"><h1>Offsyde</h1></Link>
            </div>
            <div className="flex gap-4 text-[15px] text-neutral-400 font-light">
                {links.map((link)=>(
                    <div key={link.name} className="transition-all hover:text-neutral-300">
                        <Link href={link.path}>{link.name}</Link>
                    </div>
                ))}
            </div>
            <div>
                <button className="px-4 py-2 mr-10 text-white text-[14px] font-medium bg-neutral-700 rounded-full cursor-pointer">Get Started</button>
            </div>
            
        </div>
    )
}