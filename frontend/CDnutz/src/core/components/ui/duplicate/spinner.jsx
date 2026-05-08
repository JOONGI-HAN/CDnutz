
function Spinner({ color = "var(--accent-bright)" , size = 50 }) {

  return (
    <div className = "rounded-[50%] box-border border-t animate-loading"
         style = {{
           width:           `${size}px`,
           height:          `${size}px`,
           border:          `${size / 5}px solid var(--interractive-background)`,
           borderTopColor:  color,
         }} />
  )

}



export default Spinner;
