'use client';

import {useEffect, useRef, useState, type RefObject} from 'react';
import {BatteryFull, LockKeyhole, Signal, Wifi} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {templateNames, type Configuration} from '@/lib/configurator/config';
import TemplatePreview from './TemplatePreview';
import s from './studio.module.css';

// Match the CSS frame dimensions. The screen stays 390 CSS pixels wide even
// when the device is scaled, so its responsive layout is consistent everywhere.
const PHONE_WIDTH = 414;
const PHONE_HEIGHT = 852;

type Props = {
  config: Configuration;
  mobile: boolean;
  expanded: boolean;
  viewportRef: RefObject<HTMLDivElement | null>;
  onEnquire: () => void;
};

export default function LivePreview({config, mobile, expanded, viewportRef, onEnquire}: Props) {
  const t = useTranslations('configurator');
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !mobile) return;

    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      // A hidden preview tab has no usable measurements. Keep its last size.
      if (width <= 0 || height <= 0) return;
      const fitHeight = expanded || window.matchMedia('(min-width: 761px)').matches;
      const next = Math.min(1, width / PHONE_WIDTH, fitHeight ? height / PHONE_HEIGHT : 1);
      setScale(Math.floor(next * 1000) / 1000);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [mobile, expanded]);

  return (
    <div ref={stageRef} className={`${s.previewStage} ${mobile ? s.phoneStage : ''}`} data-preview-device={mobile ? 'mobile' : 'desktop'}>
      <div className={s.deviceFit} style={mobile ? {width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale} : undefined}>
        <div className={`${s.deviceBody} ${mobile ? s.phoneBody : ''}`} style={mobile ? {transform: `scale(${scale})`} : undefined}>
          <div className={s.phoneHardware} aria-hidden="true">
            <span className={s.phoneActionButton} />
            <span className={s.phoneVolumeUp} />
            <span className={s.phoneVolumeDown} />
            <span className={s.phonePowerButton} />
          </div>
          <div className={s.deviceScreen}>
            <div className={s.phoneStatus} aria-hidden="true">
              <span className={s.phoneTime}>9:41</span>
              <span className={s.phoneIsland}><i /></span>
              <span className={s.phoneIndicators}><Signal size={16} /><Wifi size={16} /><BatteryFull size={23} /></span>
            </div>
            <div className={s.phoneAddress} aria-hidden="true"><LockKeyhole size={11} /><span>{templateNames[config.template]}</span><span className={s.phoneAddressLabel}>{t('preview')}</span></div>
            <div ref={viewportRef} tabIndex={0} role="region" aria-label={mobile ? t('mobile') : t('preview')} className={s.previewViewport}>
              <TemplatePreview config={config} onEnquire={onEnquire} />
            </div>
            <div className={s.phoneHome} aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
