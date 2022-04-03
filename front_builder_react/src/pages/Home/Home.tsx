import './Home.scss';

export default function Home() {
    return (
        <div id="home">
            Home page : présentation du concept et création de compte
            <br/>
            <br/>
            <a href="/user/create"><button>créer user</button></a>
        </div>
    );
}
