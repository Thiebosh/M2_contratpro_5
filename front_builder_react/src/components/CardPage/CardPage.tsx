import { ReactElement } from 'react';

import './CardPage.scss';

interface CardPageProps {
    size: ('small'|'medium'|'large'|'wide'),
    children?: ((JSX.Element|string)[])|ReactElement<any, any>
}
export function CardPage(props:CardPageProps) {
    return (
        <div className={'card '+props.size}>
            {props.children}
        </div>
    );
}
