import Blockies from "react-blockies";
export default function Identicon({address, size=10}: {address:string, size?:number}) {
  return <Blockies seed={address.toLowerCase()} size={size} scale={4} className="rounded-full border" />;
}
