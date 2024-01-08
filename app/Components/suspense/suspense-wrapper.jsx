import React, { Suspense } from 'react';
import { Consumer } from '../../re-stated';

export default function SuspenseWrapper(props) {
    // console.log("props in suspense wrapper", props);
    return (
        <Suspense fallback={<div className="logo" >
            <img src="/images/loading.svg" alt="loading" />
        </div >}>

            {props.component}

        </Suspense >
    )
}
