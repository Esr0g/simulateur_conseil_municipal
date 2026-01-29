import { useState } from "react"
import { type Commune } from "@/models/commune";
import Header from "@/components/custom/Header";
import SearchCard from "@/components/custom/SearchCard";
import DataCard from "@/components/custom/DataCard";
import Details from "@/components/custom/Details";
import Footer from "./components/custom/Footer";


function App() {
    const [communeData, setCommuneData] = useState<Commune | null>(null);

    return (
        <div className="flex flex-col gap-4 items-center  bg-(--color-background) w-full sm:w-3/4 xl:w-9/12 m-auto" >
            <Header />
            <SearchCard data={communeData} onDataSet={setCommuneData} />
            <DataCard data={communeData} />
            <Details />
            <Footer />
        </div >
    )
}

export default App
