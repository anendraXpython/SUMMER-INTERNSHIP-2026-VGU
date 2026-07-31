function VirtualTourEmbed({ url }) {
  if (!url) return null;

  return (
    <div className="virtual-tour-embed">
      <h4>Virtual Tour</h4>
      <div className="tour-iframe-wrap">
        <iframe
          src={url}
          title="Virtual Tour"
          allow="xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default VirtualTourEmbed;
