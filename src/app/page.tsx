import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <h1 className="">Welcome to Offsyde</h1>
      <p className="">Your one-stop solution for all your needs.</p>
      <Link href="/paggetests">Crawl Urls</Link>
     
    </div>
  );
}
