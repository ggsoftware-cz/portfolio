import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Configurator from '@/components/configurator/Configurator';
import {siteConfig} from '@/config/site';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'configurator'});
  return {
    title: t('metaTitle'), description: t('metaDescription'),
    alternates: {canonical: `/${locale}/configure`, languages: {cs: '/cs/configure', en: '/en/configure', 'x-default': '/cs/configure'}},
    openGraph: {title: t('metaTitle'), description: t('metaDescription'), url: `${siteConfig.url}/${locale}/configure`, images: ['/opengraph-image.png']},
    twitter: {title: t('metaTitle'), description: t('metaDescription'), card: 'summary_large_image', images: ['/opengraph-image.png']}
  };
}

export default async function ConfigurePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <Configurator />;
}
