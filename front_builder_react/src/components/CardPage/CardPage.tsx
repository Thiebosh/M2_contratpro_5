import { useEffect } from 'react';
import Wobble, { Fade } from 'react-awesome-reveal';

import './CardPage.scss';

interface CardPageProps {
    pageId: string,
    title: string,
    jsonName: string,
    setData: React.Dispatch<React.SetStateAction<any[]>>,
    children: JSX.Element[]
}

export default function CardPage(props:CardPageProps) {
    useEffect(() => {
        fetch(process.env.PUBLIC_URL + 'properties/' + props.jsonName + '.json')
            .then((r) => r.json())
            .then((data) => props.setData(data));
    }, [props]);

    return (
        <section className="page">
            <Fade triggerOnce delay={500}>
                <div>
                    <h2>{props.title}</h2>
                    <hr/>
                    <div className="cards" id={props.pageId}>
                        <Wobble triggerOnce cascade damping={0.1} delay={500}>
                            {props.children}
                        </Wobble>
                    </div>
                </div>
            </Fade>
        </section>
    );
}
