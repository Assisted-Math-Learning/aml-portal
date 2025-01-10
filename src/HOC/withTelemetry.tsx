import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  incrementTelemetryDataCount,
  syncTelemetryData,
} from '../store/actions/telemetryData.action';
import { telemetryDataCountSelector } from '../store/selectors/telemetryData.selector';
import { TELEMETRY_DATA_SYNC_BATCH_SIZE } from '../constant/constants';
import { enableTelemetrySelector } from '../store/selectors/auth.selector';
import telemetryService from '../services/TelemetryService';

const withTelemetry = <P extends object>(Component: React.FC<P>) => {
  const WrappedComponent: React.FC<P> = ({ ...props }) => {
    const dispatch = useDispatch();
    const enableTelemetry = useSelector(enableTelemetrySelector);
    const telemetryDataCount = useSelector(telemetryDataCountSelector);

    const [telemetryProps, setTelemetryProps] = useState({});

    useEffect(() => {
      if (
        enableTelemetry &&
        telemetryDataCount >= TELEMETRY_DATA_SYNC_BATCH_SIZE
      ) {
        dispatch(syncTelemetryData());
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableTelemetry, telemetryDataCount]);

    const onAssess = async (data: any) => {
      await telemetryService.assess(data);
      dispatch(incrementTelemetryDataCount());
    };

    useEffect(() => {
      if (enableTelemetry) {
        setTelemetryProps({
          assess: onAssess,
        });
      } else {
        setTelemetryProps({});
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableTelemetry]);

    return <Component {...props} {...telemetryProps} />;
  };

  return WrappedComponent;
};

export default withTelemetry;
