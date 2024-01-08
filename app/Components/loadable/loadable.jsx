import Loadable from 'react-loadable';
import Loading from './loading';

export default function AlgoLoadable(opts) {
  return Loadable(Object.assign({
    loading: Loading,
    delay: 200,
    timeout: 10000,
  }, opts));

  // return (<Suspense >{this.props.children}</Suspense>)
};