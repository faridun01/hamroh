/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FLUTTER_CODE, ASPNET_CODE } from '../codeTemplates';
import { Play, Copy, Check, FileText, Smartphone, Database, Terminal, Settings } from 'lucide-react';

export default function DeveloperDocs() {
  const [activeTab, setActiveTab ] = useState<'flutter' | 'aspnet' | 'api' | 'db_schema'>('flutter');
  const [subTab, setSubTab] = useState<string>('models');
  const [copied, setCopied] = useState<boolean>(false);

  // Swagger state
  const [apiEndpoint, setApiEndpoint] = useState<string>('search-trips');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiParams, setApiParams] = useState<string>(
    JSON.stringify({ fromCity: 'Душанбе', toCity: 'Худжанд', date: '2026-05-22', seats: 2 }, null, 2)
  );
  const [apiResponse, setApiResponse] = useState<string>('');
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeContent = () => {
    if (activeTab === 'flutter') {
      if (subTab === 'models') return FLUTTER_CODE.models;
      if (subTab === 'api') return FLUTTER_CODE.apiService;
      return FLUTTER_CODE.tripSearchScreen;
    } else if (activeTab === 'aspnet') {
      if (subTab === 'dbContext') return ASPNET_CODE.dbContext;
      if (subTab === 'models') return ASPNET_CODE.models;
      return ASPNET_CODE.controller;
    }
    return '';
  };

  const runApiSimulate = () => {
    setApiLoading(true);
    setTimeout(() => {
      let res = {};
      try {
        const parsed = JSON.parse(apiParams);
        if (apiEndpoint === 'send-otp') {
          res = {
            status: "Success",
            message: "OTP Code sent successfully via SMS verification provider to Tajikistan recipient.",
            phone: parsed.phone || "+992900111111",
            simulatedCode: "7171"
          };
        } else if (apiEndpoint === 'verify-otp') {
          res = {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1Mjg3MyIsImZ1bGxOYW1lIjoiRGVtb1VzZXIiLCJyb2xlIjoiUGFzc2VuZ2VyIn0.hR-Y...",
            user: {
              id: "u_sim_999",
              fullName: parsed.fullName || "Новый Мусофир",
              phone: parsed.phone || "+992900111111",
              role: "Passenger",
              city: parsed.city || "Душанбе",
              language: parsed.language || "RU"
            }
          };
        } else if (apiEndpoint === 'search-trips') {
          res = [
            {
              id: "t1",
              driverName: "Сомон Файзуллаев",
              driverRating: 4.9,
              vehicle: "Toyota Camry (7777 TJ 01)",
              fromCity: parsed.fromCity || "Душанбе",
              toCity: parsed.toCity || "Худжанд",
              departureDate: parsed.date || "2026-05-22",
              pricePerSeat: 180,
              availableSeats: 3
            }
          ];
        } else {
          res = {
            id: "b_sim_101",
            bookingStatus: "Pending",
            seatsBooked: parsed.seats || 1,
            amountToPay: (parsed.seats || 1) * 180,
            paymentMethod: "CashToDriver",
            message: "Ваша заявка ожидает подтверждения водителем."
          };
        }
      } catch (err) {
        res = { error: "Невалидный формат JSON параметров!" };
      }
      setApiResponse(JSON.stringify(res, null, 2));
      setApiLoading(false);
    }, 600);
  };

  return (
    <div id="developer-docs-panel" className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Panel title / Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="font-sans font-semibold tracking-tight text-white text-base">
            Hamroh Developers Workspace
          </h2>
        </div>
        <span className="font-mono text-xs text-slate-400 px-2 py-1 bg-slate-800 rounded">
          MVP Production v1.0
        </span>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
        <button
          id="tab-flutter"
          onClick={() => { setActiveTab('flutter'); setSubTab('models'); }}
          className={`flex items-center space-x-2 px-5 py-3 font-medium text-xs transition-colors border-b-2 outline-none ${
            activeTab === 'flutter' 
              ? 'border-emerald-500 text-emerald-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Flutter Mobile (Dart)</span>
        </button>
        <button
          id="tab-aspnet"
          onClick={() => { setActiveTab('aspnet'); setSubTab('dbContext'); }}
          className={`flex items-center space-x-2 px-5 py-3 font-medium text-xs transition-colors border-b-2 outline-none ${
            activeTab === 'aspnet' 
              ? 'border-emerald-500 text-emerald-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ASP.NET Core (C# API)</span>
        </button>
        <button
          id="tab-api"
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-2 px-5 py-3 font-medium text-xs transition-colors border-b-2 outline-none ${
            activeTab === 'api' 
              ? 'border-emerald-500 text-emerald-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Interactive Swagger UI</span>
        </button>
        <button
          id="tab-schema"
          onClick={() => setActiveTab('db_schema')}
          className={`flex items-center space-x-2 px-5 py-3 font-medium text-xs transition-colors border-b-2 outline-none ${
            activeTab === 'db_schema' 
              ? 'border-emerald-500 text-emerald-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Schema</span>
        </button>
      </div>

      {/* Code Viewer View (Flutter & .NET) */}
      {(activeTab === 'flutter' || activeTab === 'aspnet') && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          {/* Subtabs file selector */}
          <div className="flex items-center justify-between px-6 py-2 bg-slate-900/30 border-b border-slate-800">
            <div className="flex space-x-3">
              {activeTab === 'flutter' ? (
                <>
                  <button 
                    onClick={() => setSubTab('models')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'models' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    hamroh_models.dart
                  </button>
                  <button 
                    onClick={() => setSubTab('api')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'api' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    api_service.dart
                  </button>
                  <button 
                    onClick={() => setSubTab('screen')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'screen' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    trip_search_screen.dart
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setSubTab('dbContext')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'dbContext' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    ApplicationDbContext.cs
                  </button>
                  <button 
                    onClick={() => setSubTab('models')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'models' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    HamrohModels.cs
                  </button>
                  <button 
                    onClick={() => setSubTab('controller')}
                    className={`text-xs font-mono px-2.5 py-1 rounded transition-colors ${subTab === 'controller' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    TripsController.cs
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => handleCopy(getCodeContent())}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 py-1 px-2.5 bg-slate-800 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code Area */}
          <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed text-slate-300">
            <pre className="whitespace-pre">{getCodeContent()}</pre>
          </div>
        </div>
      )}

      {/* Interactive Swagger Endpoint Playground */}
      {activeTab === 'api' && (
        <div className="flex-1 flex flex-col p-6 space-y-5 overflow-auto bg-slate-950">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Test Live Mock API Endpoints
            </h3>
            <p className="text-xs text-slate-400">
              Trigger simulated API requests from Flutter to ASP.NET Core with PostgreSQL. Inspect responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Endpoints menu */}
            <div className="flex flex-col space-y-2 border-r border-slate-800 pr-2">
              <button
                onClick={() => {
                  setApiEndpoint('send-otp');
                  setApiMethod('POST');
                  setApiParams(JSON.stringify({ phone: '+992900111111' }, null, 2));
                  setApiResponse('');
                }}
                className={`text-left p-3 rounded-xl transition-colors text-xs flex flex-col ${apiEndpoint === 'send-otp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
              >
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">POST</span>
                  <span>/auth/send-otp</span>
                </div>
                <span className="text-[10px] text-slate-500">Запросить СМС код симуляции</span>
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('verify-otp');
                  setApiMethod('POST');
                  setApiParams(JSON.stringify({ phone: '+992900111111', code: '7171', fullName: 'Алишер Назаров', city: 'Душанбе', language: 'RU' }, null, 2));
                  setApiResponse('');
                }}
                className={`text-left p-3 rounded-xl transition-colors text-xs flex flex-col ${apiEndpoint === 'verify-otp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
              >
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">POST</span>
                  <span>/auth/verify-otp</span>
                </div>
                <span className="text-[10px] text-slate-500">Проверить СМС код и получить JWT</span>
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('search-trips');
                  setApiMethod('GET');
                  setApiParams(JSON.stringify({ fromCity: 'Душанбе', toCity: 'Худжанд', date: '2026-05-22', seats: 2 }, null, 2));
                  setApiResponse('');
                }}
                className={`text-left p-3 rounded-xl transition-colors text-xs flex flex-col ${apiEndpoint === 'search-trips' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
              >
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <span className="bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded text-[10px]">GET</span>
                  <span>/trips/search</span>
                </div>
                <span className="text-[10px] text-slate-500">Найти доступные поездки</span>
              </button>

              <button
                onClick={() => {
                  setApiEndpoint('bookings');
                  setApiMethod('POST');
                  setApiParams(JSON.stringify({ tripId: 't1', passengerId: 'u3', seats: 1, message: 'Привет, еду с вами!' }, null, 2));
                  setApiResponse('');
                }}
                className={`text-left p-3 rounded-xl transition-colors text-xs flex flex-col ${apiEndpoint === 'bookings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-900 text-slate-400'}`}
              >
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">POST</span>
                  <span>/bookings/create</span>
                </div>
                <span className="text-[10px] text-slate-500">Забронировать место в авто</span>
              </button>
            </div>

            {/* Params & response triggers */}
            <div className="col-span-2 flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Request JSON Configuration</span>
                  <div className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase">
                    {apiMethod} Method
                  </div>
                </div>
                <textarea
                  value={apiParams}
                  onChange={(e) => setApiParams(e.target.value)}
                  className="w-full h-28 bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                
                <button
                  onClick={runApiSimulate}
                  disabled={apiLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-600 transition-colors text-slate-950 font-semibold text-xs py-2 px-4 rounded-lg"
                >
                  {apiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Sandbox Call</span>
                    </>
                  )}
                </button>
              </div>

              {/* Response inspector */}
              <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[140px]">
                <span className="text-xs font-semibold text-slate-300 mb-2">Simulated JSON Response</span>
                <div className="flex-1 overflow-auto bg-slate-900/50 rounded-lg p-3 font-mono text-xs text-sky-400 border border-slate-900">
                  {apiResponse ? (
                    <pre>{apiResponse}</pre>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">
                      Click `Execute Sandbox Call` to trigger response trace.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relational Database Scheme Overview */}
      {activeTab === 'db_schema' && (
        <div className="flex-1 p-6 space-y-5 overflow-auto bg-slate-950">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">
              Tajikistan Hamroh DB Architecture & Schemas
            </h3>
            <p className="text-xs text-slate-400">
              Adapting BlaBlaCar system with custom Tajik identities using EF Core models with PostgreSQL relations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User card schema */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Users Table</span>
                <span className="text-[10px] font-mono text-emerald-400">Primary PK</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">fullName</b>: <span className="text-teal-400">nvarchar(100)</span></li>
                <li><b className="text-slate-200">phone</b>: <span className="text-teal-400">nvarchar(20) [UQ]</span></li>
                <li><b className="text-slate-200">role</b>: <span className="text-purple-400">Enum (Int)</span></li>
                <li><b className="text-slate-200">language</b>: <span className="text-teal-400">varchar(2)</span></li>
                <li><b className="text-slate-200">city</b>: <span className="text-teal-400">varchar(50)</span></li>
                <li><b className="text-slate-200">isActive</b>: <span className="text-amber-400">boolean</span></li>
              </ul>
            </div>

            {/* Vehicle schema card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Vehicles Table</span>
                <span className="text-[10px] font-mono text-amber-500">Foreign FK</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">driverId</b>: <span className="text-sky-400">Guid (FK → Users)</span></li>
                <li><b className="text-slate-200">brand / model</b>: <span className="text-teal-400">nvarchar(50)</span></li>
                <li><b className="text-slate-200">plateNumber</b>: <span className="text-teal-400">nvarchar(15)</span></li>
                <li><b className="text-slate-200">seats</b>: <span className="text-pink-400">int</span></li>
                <li><b className="text-slate-200">verificationStatus</b>: <span className="text-purple-400">Enum</span></li>
              </ul>
            </div>

            {/* Trips schema card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Trips Table</span>
                <span className="text-[10px] font-mono text-purple-400">Relational Master</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">driverId</b>: <span className="text-sky-400">Guid (FK)</span></li>
                <li><b className="text-slate-200">fromCity / toCity</b>: <span className="text-teal-400">varchar(50)</span></li>
                <li><b className="text-slate-200">pricePerSeat</b>: <span className="text-amber-500">decimal</span></li>
                <li><b className="text-slate-200">availableSeats</b>: <span className="text-pink-400">int</span></li>
                <li><b className="text-slate-200">status</b>: <span className="text-purple-400">Enum (TripStatus)</span></li>
              </ul>
            </div>

            {/* Bookings schema card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Bookings Table</span>
                <span className="text-[10px] font-mono text-purple-400">Join Relational</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">tripId</b>: <span className="text-sky-400">Guid (FK → Trips)</span></li>
                <li><b className="text-slate-200">passengerId</b>: <span className="text-sky-400">Guid (FK → Users)</span></li>
                <li><b className="text-slate-200">seatsCount</b>: <span className="text-pink-400">int</span></li>
                <li><b className="text-slate-200">status</b>: <span className="text-purple-400">Enum (BookingStatus)</span></li>
                <li><b className="text-slate-200">totalPrice</b>: <span className="text-amber-500">decimal</span></li>
              </ul>
            </div>

            {/* Reviews schema card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Reviews Table</span>
                <span className="text-[10px] font-mono text-emerald-400">Safety & Feedback</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">fromUserId</b>: <span className="text-sky-400">Guid (FK)</span></li>
                <li><b className="text-slate-200">toUserId</b>: <span className="text-sky-400">Guid (FK)</span></li>
                <li><b className="text-slate-200">rating (1-5)</b>: <span className="text-pink-400">int</span></li>
                <li><b className="text-slate-200">safetyRating</b>: <span className="text-pink-400">int</span></li>
                <li><b className="text-slate-200">comment</b>: <span className="text-teal-400">nvarchar(max)</span></li>
              </ul>
            </div>

            {/* Complaints schema card */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white">Complaints Table</span>
                <span className="text-[10px] font-mono text-red-500">Moderation</span>
              </div>
              <ul className="text-[11px] font-mono space-y-1.5 text-slate-400">
                <li><b className="text-slate-200">id</b>: <span className="text-sky-400">Guid (PK)</span></li>
                <li><b className="text-slate-200">userId</b>: <span className="text-sky-400">Guid (FK)</span></li>
                <li><b className="text-slate-200">tripId</b>: <span className="text-sky-400">Guid (FK)</span></li>
                <li><b className="text-slate-200">type</b>: <span className="text-purple-400">Enum (ComplaintType)</span></li>
                <li><b className="text-slate-200">status</b>: <span className="text-purple-400">Enum (Status)</span></li>
                <li><b className="text-slate-200">adminNote</b>: <span className="text-teal-400">nvarchar(max)</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
