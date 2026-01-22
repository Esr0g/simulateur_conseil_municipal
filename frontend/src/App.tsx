import { useState } from "react"
import { type Commune } from "@/models/commune";
import Header from "./components/custom/Header";
import SearchCard from "./components/custom/SearchCard";
import DataCard from "./components/custom/DataCard";


function App() {
    const [communeData, setCommuneData] = useState<Commune | null>(null);

    return (
        <div className="flex flex-col gap-4 items-center  bg-(--color-background) w-full sm:w-3/4 xl:w-9/12 m-auto" >
            <Header />
            <SearchCard onDataSet={setCommuneData} />
            <DataCard data={communeData} />
        </div >
    )
}

export default App
