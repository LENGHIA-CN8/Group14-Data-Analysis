import * as React from 'react';

function MarkerInfo(props) {
  const {info} = props;
  const displayName = `${info.name}, ${info.state}`;

  return (
    <div>
      <div>
        {displayName}
      </div>
      <div>
        Địa chỉ: {info.address}
      </div>
      {/* <img width={240} src={info.image} /> */}
    </div>
  );
}

export default React.memo(MarkerInfo);