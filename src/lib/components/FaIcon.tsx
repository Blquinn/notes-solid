export interface FaIconProps {
  path: string;
  alt?: string;
  size?: number;
}

export default function FaIcon(props: FaIconProps) {
  const alt = props.alt ?? props.path;
  const size = props.size ?? 24;
  return (<img src={props.path} alt={alt} height={size} width={size} />)
}
