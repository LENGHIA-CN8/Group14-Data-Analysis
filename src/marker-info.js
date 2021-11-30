import * as React from 'react';

function MarkerInfo(props) {
  const {info} = props;
  const displayName = `${info.name}, ${info.state}`;

  return (
    <div className='info'>
      <div className='name'>
        {displayName}
      </div>
      <div className='address'>
        Địa chỉ: {info.address}
      </div>
      <img width={248} src={info.image} />
    </div>
  );
}

export default React.memo(MarkerInfo);