import { useState } from "react";

export default function Test(){
  const [state, setState] = useState([true, false, true, false, true])
  const [color, setColor] = useState(["","white","white","white","white"])
	async function fetchData(){
		const response = await fetch("https://get.geojs.io/v1/ip/country?ip=8.8.8.8")
		const data = await response.text()
		console.log(data)
		return "blue"
	}
  async function turnBlue(){
    for(let i = 0; i < state.length; i++){
      if(!state[i]) continue
      const data = await fetchData()
      setColor(old => old.map((item,idx) => idx == i ? data : item))
    }
  }
  return(
    <div className="box">
       <button type="button" onClick={() => turnBlue()}>turn blue</button>
      {state.map((item, idx) => <div style={{background: color[idx]}}>{idx+" "+item}</div>)}
    </div>
  );
}
