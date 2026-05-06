'use client';
import { useState } from 'react';
import { analyzeWaterUsage, getZones } from '@/lib/api';

export default function Dashboard() {
  const [facilityId, setFacilityId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const data = await analyzeWaterUsage(facilityId);
      setResult(data);
      const z = await getZones(data.id);
      setZones(z);
    } catch (e) {
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:40,maxWidth:800}}>
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input placeholder="Facility ID" value={facilityId} onChange={e => setFacilityId(e.target.value)}
          style={{padding:'10px 16px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#f8fafc',minWidth:240}} />
        <button onClick={handleAnalyze} disabled={loading}
          style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#3B82F6',color:'#fff',cursor:'pointer'}}>
          {loading ? 'Analyzing...' : 'Analyze Water Usage'}
        </button>
      </div>

      {result && (
        <div style={{display:'grid',gap:16}}>
          <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
            <h3 style={{marginBottom:12,color:'#3B82F6'}}>Water Analysis Result</h3>
            <p><strong>Total consumption:</strong> {result.total_consumption_kl} kL</p>
            <p><strong>Leak detected:</strong> {result.leak_detected ? 'Yes' : 'No'}</p>
            <p><strong>Irrigation efficiency:</strong> {result.irrigation_efficiency}</p>
            <p><strong>Recycling potential:</strong> {result.recycling_potential}</p>
          </div>
          {zones.length > 0 && (
            <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
              <h3 style={{marginBottom:12,color:'#3B82F6'}}>Zone Consumption</h3>
              {zones.map((zone, i) => (
                <p key={i}>{zone.zone_name}: {zone.consumption_kl} kL</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
