
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
    path:"/statsheets"
}]
export default function Navbar() {
    return (
        <div className="z-50 sticky top-0 flex justify-around items-center gap-4 mx-auto my-4 max-w-3xl h-14 bg-white/5 rounded-[150px] border-neutral-500 shadow-md backdrop-blur-3xl border">
            <div className="ml-10 font-bold text-2xl"> 
                <Link href="/"><h1>Offsyde</h1></Link>
            </div>
            <div className="flex gap-10 text-[15px] text-neutral-400 font-light">
                {links.map((link)=>(
                    <div key={link.name} className="transition-all hover:text-neutral-300">
                        <Link href={link.path}>{link.name}</Link>
                    </div>
                ))}
            </div>
           
            
        </div>
    )
}