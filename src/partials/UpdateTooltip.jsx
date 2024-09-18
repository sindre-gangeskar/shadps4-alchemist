import '../css/UpdateTooltip.css';
function UpdateTooltip({ content, visible, onClick }) {
  return (
  <div className={`update-tooltip-wrapper ${visible ? 'show' : 'hide'}`} onClick={onClick}>
    {content}
  </div>
  )
}

export default UpdateTooltip;