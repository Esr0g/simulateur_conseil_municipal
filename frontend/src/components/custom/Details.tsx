export default function Details() {
    return (
        <div className="flex flex-col gap-1 w-full bg-card sm:rounded-sm md:rounded-md lg:rounded-lg xl:rounded-xl border-y sm:border px-4 py-2.5">
            <h3 className="scroll-m-20 text-xl tracking-tight mt-2 mb-2">
                À propos
            </h3>
            <p>
                On entend souvent que "tout le monde pourrait devenir élu municipal". Mais est-ce si vrai ?
            </p>
            <p>
                <a href="https://democratiserlapolitique.org/rapport-de-recherche/" target="_blank">Les travaux du collectif Démocratiser la politique</a> montrent que les inégalités de représentation sont tout aussi présentes en local qu'au national.
                Les classes populaires y sont largement sous-représentées, ce qui n'est pas sans effets sur la nature des débats
                et des décisions prises. <br />
            </p>
            <p>
                Pour prendre la mesure de ce décalage, on vous propose de faire le test vous-même.
                Il suffit de rentrer le nom de votre commune pour en connaitre sa sociologie (avec les données recensements)
                et sa transposition en nombre de sièges au sein de l'assemblée.
            </p>
            <p>
                Voilà un outil concret pour interpeller vos (futurs) élus sur l'ampleur de la marche à
                franchir pour améliorer la représentativité des assemblées communales !
            </p>
        </div >)
}