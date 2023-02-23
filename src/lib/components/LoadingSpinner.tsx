import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  class?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  return (
    <div class={`${styles.ldsRing} ${props.class ?? ''}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}
