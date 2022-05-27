import './Home.scss';

export function Home() {
    return (
        <section id="home">
            <h1>Welcome to <span>&#60;SpecTry/&#62;</span></h1>
            <br/>
            <h3>Présentation de l'outil :</h3>
            <p>
                Cet outil a pour but de structurer les besoins d’un utilisateur, et de générer de façon automatique un
                prototype fonctionnel de son projet.
            </p>
            <p>
                Après vous être connecté, vous aurez accès à la première brique du projet, recueil du besoin.
                <br/>
                Les différentes bulles et éléments à l’écran permettent l’implémentation du cahier des charges, prenant
                en compte les différents écrans, le contenu comme du texte, des images, … ainsi que la mise en forme
                avec les couleurs, la disposition des éléments dans l’espace, …
            </p>
            <p>
                Une fois vos besoins formalisés dans l’arbre prévu à cet effet, vous avez la possibilité de générer un
                prototype de projet et de visualiser le rendu dans l’outil.
            </p>
            <p>
                L’avantage de <span>SpecTry</span> est de fournir à ses utilisateurs un travail collaboratif sur leurs
                projets.
                <br/>
                En effet, ajoutez des utilisateurs sur un projet et travaillez alors ensemble sur sa réalisation, en
                simultané ! Les modifications apparaissant sur les différents postes connectés au projet.
            </p>
            <p>
                L'outil se base sur un dictionnaire de base afin de recueillir vos besoins, mais rien ne vous empêche
                d'implémenter ce dictionnaire avec vos propres règles pour tout type de projet.
            </p>
            <br/>
            <h3>Exemple d'utilisation :</h3>
            <p>
                Vous souhaitez ouvrir un hotel et donc gérer vos réservations via un site.
            </p>
            <p>
                Vous créez donc votre page d’accueil qui accueillera les informations principales : le nom de l’hotel,
                sa localisation, les activités, …
                <br/>
                Une seconde page vous permettrera d’accéder à la réservation d’une chambre : nombre de lits, salle de
                bain, …
                <br/>
                Et ainsi de suite ..
            </p>
            <p>
                Au fur et à mesure que votre arborescence se dessine, vous pouvez visualiser le rendu dans le prototype
            </p>
        </section>
    );
}
