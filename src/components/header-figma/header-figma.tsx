

const HeaderFigma = () => {

    return(
        <div style={{width: '100%', height: '100%', position: 'relative', background: '#FDE776', overflow: 'hidden', borderRadius: 100, outline: '1px #0E5D4E solid', outlineOffset: '-1px'}}>
            <div style={{width: 42.88, height: 47.34, left: 24, top: 30, position: 'absolute', background: '#0E5D4E'}} />
            <div style={{left: 83, top: 39, position: 'absolute', color: '#0E5D4E', fontSize: 24, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word'}}>WIMAPP</div>
            <div style={{width: 36, height: 36, paddingLeft: 1, paddingRight: 1, left: 1332, top: 36, position: 'absolute', borderRadius: 18, outline: '2px #0E5D4E solid', outlineOffset: '-2px', justifyContent: 'center', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
                <div style={{width: 32, height: 32, position: 'relative', transform: 'rotate(-90deg)', transformOrigin: 'top left'}}>
                    <div style={{width: 21.28, height: 17.79, left: 5.33, top: 7.15, position: 'absolute', background: '#0E5D4E'}} />
                    <div style={{width: 32, height: 32, left: 0, top: 0, position: 'absolute'}} />
                </div>
            </div>
        </div>
    )
}

export default HeaderFigma