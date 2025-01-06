import React from 'react';
import { indexedDBService } from '../services/IndexedDBService';
import { IDBDataStatus, IDBStores } from '../types/enum';

const withTelemetry = <P extends object>(Component: React.FC<P>) => {
  const WrappedComponent: React.FC<P> = ({ ...props }) => {
    const onAssess = async (data: any) => {
      await indexedDBService.addObject(
        {
          data,
          status: IDBDataStatus.NOOP,
        },
        IDBStores.TELEMETRY_DATA
      );
    };

    const telemetryProps = {
      assess: onAssess,
    };

    return <Component {...props} {...telemetryProps} />;
  };

  return WrappedComponent;
};

export default withTelemetry;
